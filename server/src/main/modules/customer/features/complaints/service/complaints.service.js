import mongoose from 'mongoose';
import Complaint from '../../../../../models/Complaint.js';
import Customer from '../../../../../models/Customer.js';
import Branch from '../../../../../models/Branch.js';
import Address from '../../../../../models/Address.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerComplaintsService {
  _normalizeStatusInput(status) {
    if (!status) return null;
    return status === 'in-progress' ? 'in_progress' : status;
  }

  _normalizeStatusOutput(status) {
    return status === 'in_progress' ? 'in-progress' : status;
  }

  _toObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : null;
  }

  async _inferAssignedBranchId(customerAddressId) {
    const customerAddress = await Address.findById(customerAddressId).lean();
    if (!customerAddress) {
      return null;
    }

    const branches = await Branch.find({ status: 'Active' })
      .select('_id address_id')
      .populate('address_id', 'city province country')
      .lean();

    const city = String(customerAddress.city || '')
      .trim()
      .toLowerCase();
    const province = String(customerAddress.province || '')
      .trim()
      .toLowerCase();
    const country = String(customerAddress.country || '')
      .trim()
      .toLowerCase();

    const exactMatch = branches.find(branch => {
      const address = branch.address_id || {};
      return (
        String(address.city || '')
          .trim()
          .toLowerCase() === city &&
        String(address.province || '')
          .trim()
          .toLowerCase() === province &&
        String(address.country || '')
          .trim()
          .toLowerCase() === country
      );
    });

    if (exactMatch) {
      return exactMatch._id;
    }

    const provinceMatch = branches.find(branch => {
      const address = branch.address_id || {};
      return (
        String(address.province || '')
          .trim()
          .toLowerCase() === province &&
        String(address.country || '')
          .trim()
          .toLowerCase() === country
      );
    });

    return provinceMatch?._id || null;
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

  _formatComplaint(complaint) {
    if (!complaint) return null;

    const mapped = {
      ...complaint,
      status: this._normalizeStatusOutput(complaint.status),
    };

    if (Array.isArray(mapped.messages)) {
      mapped.messages = mapped.messages.map(msg => ({
        ...msg,
        sender_role:
          msg.sender_role === 'in_progress' ? 'in-progress' : msg.sender_role,
      }));
    }

    return mapped;
  }

  async createComplaint(customerId, payload, files, req) {
    const customer = await Customer.findById(customerId).lean();
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const customerAddressId =
      payload.customer_address_id || customer.address_id || null;

    if (!customerAddressId) {
      throw new Error('CUSTOMER_ADDRESS_REQUIRED');
    }

    const supportingDocuments = await this._uploadFiles(
      files,
      'customer/complaints/supporting_documents'
    );

    const complaint = await Complaint.create({
      customer_id: customerId,
      customer_address_id: customerAddressId,
      assigned_branch_id: await this._inferAssignedBranchId(customerAddressId),
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority || 'medium',
      supporting_documents: supportingDocuments,
      messages: [],
      status: 'pending',
    });

    await logCustomerActivity(
      req,
      'complaint_create',
      `Created complaint ${complaint._id}`,
      'complaints',
      complaint._id,
      {
        category: complaint.category,
        priority: complaint.priority,
        supporting_document_count: supportingDocuments.length,
      }
    );

    const created = await Complaint.findById(complaint._id)
      .populate('customer_id', 'fullName email profile_img_url')
      .lean();

    return this._formatComplaint(created);
  }

  async listMyComplaints(customerId, filters = {}) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);
    const skip = (page - 1) * limit;

    const query = { customer_id: customerId };

    const status = this._normalizeStatusInput(filters.status);
    if (status) query.status = status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
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

  async getComplaintById(customerId, complaintId) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      customer_id: customerId,
    })
      .populate('customer_id', 'fullName email profile_img_url')
      .populate('branch_admin_id', 'name email category')
      .populate('super_admin_id', 'name email category')
      .lean();

    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    return this._formatComplaint(complaint);
  }

  async addComplaintMessage(customerId, complaintId, payload, files, req) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      customer_id: customerId,
    });

    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

    const attachments = await this._uploadFiles(
      files,
      'customer/complaints/thread_attachments'
    );

    complaint.messages.push({
      sender_role: 'customer',
      sender_id: customerId,
      message: payload.message,
      attachments,
      sent_at: new Date(),
    });

    await complaint.save();

    await logCustomerActivity(
      req,
      'complaint_thread_message',
      `Added complaint message to ${complaint._id}`,
      'complaints',
      complaint._id,
      { attachment_count: attachments.length }
    );

    const updated = await this.getComplaintById(customerId, complaintId);
    return updated;
  }

  async rateComplaintResolution(customerId, complaintId, payload, req) {
    const complaint = await Complaint.findOne({
      _id: complaintId,
      customer_id: customerId,
    });

    if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');
    if (complaint.status !== 'resolved')
      throw new Error('COMPLAINT_NOT_RESOLVED');
    if (complaint.resolution_rating) throw new Error('COMPLAINT_ALREADY_RATED');

    complaint.resolution_rating = Number(payload.rating);
    complaint.resolution_feedback = payload.feedback || '';
    complaint.resolution_rated_at = new Date();

    await complaint.save();

    await logCustomerActivity(
      req,
      'complaint_resolution_rated',
      `Rated resolution for complaint ${complaint._id}`,
      'complaints',
      complaint._id,
      { rating: complaint.resolution_rating }
    );

    const updated = await this.getComplaintById(customerId, complaintId);
    return updated;
  }
}

export default new CustomerComplaintsService();
