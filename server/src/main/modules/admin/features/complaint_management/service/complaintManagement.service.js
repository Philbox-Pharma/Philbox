import Complaint from '../../../../../models/Complaint.js';
import Customer from '../../../../../models/Customer.js';
import Admin from '../../../../../models/Admin.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { sendEmail } from '../../../../../utils/sendEmail.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class ComplaintManagementService {
  _normalizeStatusInput(status) {
    if (!status) return null;
    return status === 'in-progress' ? 'in_progress' : status;
  }

  _normalizeStatusOutput(status) {
    return status === 'in_progress' ? 'in-progress' : status;
  }

  _formatComplaint(complaint) {
    if (!complaint) return null;
    return {
      ...complaint,
      status: this._normalizeStatusOutput(complaint.status),
    };
  }

  _buildScopeFilter(admin) {
    if (!admin || admin.category === 'super-admin') {
      return {};
    }

    const managedBranches = (admin.branches_managed || []).map(id =>
      String(id)
    );
    const adminId = String(admin.id || admin._id);

    return {
      $or: [
        { assigned_branch_id: { $in: managedBranches } },
        { branch_admin_id: adminId },
        { assigned_to_admin_id: adminId },
      ],
    };
  }

  async _uploadFiles(files, folder) {
    const urls = [];

    for (const file of files || []) {
      try {
        const url = await uploadToCloudinary(file.path, folder);
        if (url) urls.push(url);
      } catch {
        throw new Error('FILE_UPLOAD_FAILED');
      }
    }

    return urls;
  }

  async listComplaints(admin, filters = {}) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);
    const skip = (page - 1) * limit;

    const query = {
      ...this._buildScopeFilter(admin),
    };

    const status = this._normalizeStatusInput(filters.status);
    if (status) query.status = status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer_id', 'fullName email contactNumber')
        .populate('assigned_branch_id', 'name code')
        .populate('assigned_to_admin_id', 'name email category')
        .populate('branch_admin_id', 'name email category')
        .populate('super_admin_id', 'name email category')
        .lean(),
      Complaint.countDocuments(query),
    ]);

    return {
      complaints: complaints.map(c => this._formatComplaint(c)),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };
  }

  async getComplaintById(admin, complaintId) {
    const query = {
      _id: complaintId,
      ...this._buildScopeFilter(admin),
    };

    const complaint = await Complaint.findOne(query)
      .populate('customer_id', 'fullName email contactNumber profile_img_url')
      .populate('assigned_branch_id', 'name code')
      .populate('assigned_to_admin_id', 'name email category')
      .populate('branch_admin_id', 'name email category')
      .populate('super_admin_id', 'name email category')
      .lean();

    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    return this._formatComplaint(complaint);
  }

  async addAdminMessage(admin, complaintId, payload, files, req) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      ...this._buildScopeFilter(admin),
    });
    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    const attachments = await this._uploadFiles(
      files,
      'admin/complaints/thread_attachments'
    );

    const senderRole =
      admin.category === 'super-admin' ? 'super-admin' : 'branch-admin';

    complaint.messages.push({
      sender_role: senderRole,
      sender_id: admin.id || admin._id,
      message: payload.message,
      attachments,
      sent_at: new Date(),
    });

    if (senderRole === 'super-admin') {
      complaint.super_admin_id = admin.id || admin._id;
    } else {
      const exists = (complaint.branch_admin_id || []).some(
        id => String(id) === String(admin.id || admin._id)
      );
      if (!exists) complaint.branch_admin_id.push(admin.id || admin._id);
    }

    await complaint.save();

    await logAdminActivity(
      req,
      'complaint_thread_reply',
      `Replied to complaint ${complaint._id}`,
      'complaints',
      complaint._id,
      { sender_role: senderRole, attachment_count: attachments.length }
    );

    return this.getComplaintById(admin, complaintId);
  }

  async updateComplaintStatus(admin, complaintId, payload, req) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      ...this._buildScopeFilter(admin),
    });
    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    const nextStatus = this._normalizeStatusInput(payload.status);
    if (!nextStatus) throw new Error('INVALID_STATUS');

    const previousStatus = complaint.status;
    complaint.status = nextStatus;

    if (payload.resolution_note !== undefined) {
      complaint.resolution_note = payload.resolution_note || '';
    }

    if (nextStatus === 'resolved' && !complaint.resolved_at) {
      complaint.resolved_at = new Date();
    }

    if (admin.category === 'super-admin') {
      complaint.super_admin_id = admin.id || admin._id;
    } else {
      const exists = (complaint.branch_admin_id || []).some(
        id => String(id) === String(admin.id || admin._id)
      );
      if (!exists) complaint.branch_admin_id.push(admin.id || admin._id);
    }

    await complaint.save();

    await logAdminActivity(
      req,
      'complaint_status_update',
      `Updated complaint ${complaint._id} status to ${nextStatus}`,
      'complaints',
      complaint._id,
      {
        previous_status: previousStatus,
        next_status: nextStatus,
      }
    );

    const customer = await Customer.findById(complaint.customer_id)
      .select('email fullName')
      .lean();

    if (customer?.email) {
      const title = complaint.title || 'Complaint';
      const subject = `Complaint Status Updated: ${title}`;
      const html = `<p>Hi ${customer.fullName || 'Customer'},</p>
<p>Your complaint <strong>${title}</strong> status changed to <strong>${this._normalizeStatusOutput(nextStatus)}</strong>.</p>
<p>Complaint ID: ${complaint._id}</p>
${complaint.resolution_note ? `<p>Resolution Note: ${complaint.resolution_note}</p>` : ''}
<p>Thank you,<br/>Philbox Support</p>`;

      try {
        await sendEmail(customer.email, subject, html);
      } catch (error) {
        console.error('Failed to send complaint status email:', error.message);
      }
    }

    return this.getComplaintById(admin, complaintId);
  }

  async assignComplaint(admin, complaintId, payload, req) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      ...this._buildScopeFilter(admin),
    });

    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    const assigneeId = payload.assignee_admin_id;
    const assignee = await Admin.findById(assigneeId).lean();
    if (!assignee) throw new Error('ASSIGNEE_NOT_FOUND');

    const managedBranches = (admin.branches_managed || []).map(id =>
      String(id)
    );
    const assigneeBranches = (assignee.branches_managed || []).map(id =>
      String(id)
    );

    if (admin.category !== 'super-admin') {
      const overlap = assigneeBranches.some(branchId =>
        managedBranches.includes(branchId)
      );
      if (!overlap && String(assignee._id) !== String(admin.id || admin._id)) {
        throw new Error('ASSIGNEE_OUTSIDE_BRANCH_SCOPE');
      }
    }

    complaint.assigned_to_admin_id = assignee._id;

    if (!complaint.assigned_branch_id && assigneeBranches.length) {
      complaint.assigned_branch_id = assigneeBranches[0];
    }

    const exists = (complaint.branch_admin_id || []).some(
      id => String(id) === String(assignee._id)
    );
    if (!exists) {
      complaint.branch_admin_id.push(assignee._id);
    }

    await complaint.save();

    await logAdminActivity(
      req,
      'complaint_assigned',
      `Assigned complaint ${complaint._id} to admin ${assignee._id}`,
      'complaints',
      complaint._id,
      {
        assignee_admin_id: assignee._id,
      }
    );

    return this.getComplaintById(admin, complaintId);
  }

  async exportComplaintsReport(admin, filters = {}, req) {
    const query = {
      ...this._buildScopeFilter(admin),
    };

    const status = this._normalizeStatusInput(filters.status);
    if (status) query.status = status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;

    const complaints = await Complaint.find(query)
      .sort({ created_at: -1 })
      .populate('customer_id', 'fullName email')
      .populate('assigned_branch_id', 'name code')
      .populate('assigned_to_admin_id', 'name email')
      .lean();

    const header = [
      'complaint_id',
      'title',
      'category',
      'priority',
      'status',
      'customer_name',
      'customer_email',
      'assigned_branch',
      'assigned_admin',
      'resolution_rating',
      'created_at',
      'resolved_at',
    ];

    const escapeCsv = value => {
      const text = String(value ?? '');
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = complaints.map(item => [
      item._id,
      item.title,
      item.category,
      item.priority,
      this._normalizeStatusOutput(item.status),
      item.customer_id?.fullName || '',
      item.customer_id?.email || '',
      item.assigned_branch_id?.name || '',
      item.assigned_to_admin_id?.name || '',
      item.resolution_rating || '',
      item.created_at || '',
      item.resolved_at || '',
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n');

    if (req) {
      await logAdminActivity(
        req,
        'complaint_report_export',
        'Exported complaints report',
        'complaints',
        null,
        { total_records: complaints.length }
      );
    }

    return {
      file_name: `complaints-report-${Date.now()}.csv`,
      mime_type: 'text/csv',
      total_records: complaints.length,
      csv,
    };
  }
}

export default new ComplaintManagementService();
