import mongoose from 'mongoose';

import PrescriptionGeneratedByDoctor from '../../../../../models/PrescriptionGeneratedByDoctor.js';
import PrescriptionUploadedByCustomer from '../../../../../models/PrescriptionUploadedByCustomer.js';
import PrescriptionItem from '../../../../../models/PrescriptionItem.js';
import Order from '../../../../../models/Order.js';
import Branch from '../../../../../models/Branch.js';
import Appointment from '../../../../../models/Appointment.js';
import Doctor from '../../../../../models/Doctor.js';
import Customer from '../../../../../models/Customer.js';
import Medicine from '../../../../../models/Medicine.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import cartService from '../../cart/service/cart.service.js';
import {
  emitToBranch,
  emitToSalesperson,
} from '../../../../../config/socket.config.js';

class CustomerPrescriptionsService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  _parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  _buildSort(sortBy, sortOrder) {
    const direction =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const normalized = String(sortBy || 'created_at').trim();

    const allowed = new Set([
      'created_at',
      'updated_at',
      'valid_till',
      'doctor_name',
      'diagnosis',
      'type',
    ]);

    return {
      sortKey: allowed.has(normalized) ? normalized : 'created_at',
      direction,
    };
  }

  _sortCombinedPrescriptions(prescriptions, sortKey, direction) {
    const compareDate = (a, b, key) => {
      const aTime = new Date(a?.[key] || 0).getTime();
      const bTime = new Date(b?.[key] || 0).getTime();
      return (aTime - bTime) * direction;
    };

    const compareText = (a, b, key) => {
      const aValue = String(a?.[key] || '').toLowerCase();
      const bValue = String(b?.[key] || '').toLowerCase();
      return (
        aValue.localeCompare(bValue, undefined, {
          sensitivity: 'base',
        }) * direction
      );
    };

    const compareNumber = (a, b, key) => {
      const aValue = Number(a?.[key] || 0);
      const bValue = Number(b?.[key] || 0);
      return (aValue - bValue) * direction;
    };

    const comparatorMap = {
      created_at: (a, b) => compareDate(a, b, 'created_at'),
      updated_at: (a, b) => compareDate(a, b, 'updated_at'),
      valid_till: (a, b) => compareDate(a, b, 'valid_till'),
      doctor_name: (a, b) => compareText(a?.doctor, b?.doctor, 'fullName'),
      diagnosis: (a, b) => compareText(a, b, 'diagnosis_reason'),
      type: (a, b) => compareText(a, b, 'type'),
    };

    const comparator = comparatorMap[sortKey] || comparatorMap.created_at;

    return prescriptions.slice().sort((a, b) => {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }

      if (a.source === b.source) {
        return compareDate(a, b, 'created_at');
      }

      return compareText(a, b, 'type');
    });
  }

  _formatDoctorName(doctor) {
    if (!doctor) return 'N/A';
    return (
      doctor.fullName ||
      `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() ||
      'N/A'
    );
  }

  _mapDigitalPrescription(prescription) {
    const doctor = prescription.doctor_id || null;
    const items = Array.isArray(prescription.prescription_items_ids)
      ? prescription.prescription_items_ids
      : [];

    return {
      _id: prescription._id,
      source: 'digital',
      type: 'digital',
      status:
        prescription.valid_till &&
        new Date(prescription.valid_till) < new Date()
          ? 'expired'
          : 'active',
      created_at: prescription.created_at,
      updated_at: prescription.updated_at,
      valid_till: prescription.valid_till,
      diagnosis_reason: prescription.diagnosis_reason,
      special_instructions: prescription.special_instructions || '',
      digital_verification_id: prescription.digital_verification_id || null,
      file_url: prescription.file_url || null,
      doctor: doctor
        ? {
            _id: doctor._id,
            fullName: this._formatDoctorName(doctor),
            specialization: doctor.specialization || [],
            profile_img_url: doctor.profile_img_url || null,
            consultation_fee: Number(doctor.consultation_fee || 0),
          }
        : null,
      appointment: prescription.appointment_id
        ? {
            _id: prescription.appointment_id._id,
            status: prescription.appointment_id.status,
            appointment_type: prescription.appointment_id.appointment_type,
            created_at: prescription.appointment_id.created_at,
          }
        : null,
      medicines: items.map(item => ({
        _id: item._id,
        medicine_id: item.medicine_id?._id || item.medicine_id || null,
        medicine_name:
          item.medicine_id?.Name || item.medicine_id?.name || 'Medicine',
        form: item.form || null,
        dosage: item.dosage || null,
        frequency: item.frequency || null,
        duration_days: item.duration_days || 0,
        quantity_prescribed: item.quantity_prescribed || 0,
      })),
      medicine_count: items.length,
      can_order_medicines: items.length > 0,
    };
  }

  _mapUploadedPrescription(prescription) {
    const allowPayload = prescription.allow_payload || null;
    const allowItems = Array.isArray(allowPayload?.items)
      ? allowPayload.items
      : [];
    const approvedMedicineIds = allowItems
      .map(item => String(item?.medicine_id || item?.medicineId || '').trim())
      .filter(Boolean);

    return {
      _id: prescription._id,
      source: 'uploaded',
      type: 'uploaded',
      status: prescription.order_id ? 'linked' : 'stored',
      review_status: prescription.review_status || 'pending',
      created_at: prescription.created_at,
      updated_at: prescription.updated_at,
      prescription_url: prescription.prescription_url,
      prescription_type: prescription.prescription_type,
      order_id: prescription.order_id || null,
      branch_id: prescription.branch_id || null,
      salesperson_id: prescription.salesperson_id || null,
      reviewed_by_salesperson_id:
        prescription.reviewed_by_salesperson_id || null,
      reviewed_at: prescription.reviewed_at || null,
      review_notes: prescription.review_notes || '',
      allow_payload: allowPayload,
      notes: prescription.notes || '',
      can_order_medicines:
        prescription.review_status === 'approved' &&
        approvedMedicineIds.length > 0,
    };
  }

  _normalizeApprovalPayload(payload = {}) {
    const rawItems = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.allowed_medicine_ids)
        ? payload.allowed_medicine_ids.map(item => ({
            medicine_id: item,
            quantity: 1,
          }))
        : [];

    const items = rawItems
      .map(item => {
        const medicineId = String(
          item?.medicine_id || item?.medicineId || item?.id || item || ''
        ).trim();
        if (!medicineId) {
          return null;
        }

        return {
          medicine_id: medicineId,
          quantity: Math.max(
            1,
            Number(item?.quantity || item?.quantity_allowed || 1) || 1
          ),
          medicine_name:
            String(item?.medicine_name || item?.name || '').trim() || null,
          notes: String(item?.notes || '').trim() || null,
        };
      })
      .filter(Boolean);

    return {
      can_add_to_cart: payload.can_add_to_cart !== false,
      notes: String(payload.notes || payload.review_notes || '').trim(),
      items,
    };
  }

  async _notifyUploadedPrescriptionReviewTarget(record) {
    try {
      const targetSalespersonId = record.salesperson_id
        ? String(record.salesperson_id)
        : null;
      const targetBranchId = record.branch_id ? String(record.branch_id) : null;

      if (targetSalespersonId) {
        emitToSalesperson(targetSalespersonId, 'new_prescription_available', {
          prescription_id: String(record._id),
          customer_id: String(record.patient_id),
          order_id: record.order_id ? String(record.order_id) : null,
          branch_id: targetBranchId,
          prescription_type: record.prescription_type || 'general',
          review_status: record.review_status || 'pending',
          notes: record.notes || '',
          created_at: record.created_at,
        });
        return;
      }

      if (targetBranchId) {
        emitToBranch(targetBranchId, 'new_prescription_available', {
          prescription_id: String(record._id),
          customer_id: String(record.patient_id),
          order_id: record.order_id ? String(record.order_id) : null,
          branch_id: targetBranchId,
          prescription_type: record.prescription_type || 'general',
          review_status: record.review_status || 'pending',
          notes: record.notes || '',
          created_at: record.created_at,
        });
      }
    } catch (error) {
      console.error('Error notifying prescription review target:', error);
    }
  }

  async getMyPrescriptions(customerId, filters = {}) {
    const page = this._parsePositiveInt(filters.page, 1);
    const limit = this._parsePositiveInt(filters.limit, 10);
    const fromDate = this._parseDate(filters.fromDate);
    const toDate = this._parseDate(filters.toDate);
    const search = String(filters.search || '').trim();
    const type = String(filters.type || 'all')
      .trim()
      .toLowerCase();
    const doctorId = String(filters.doctorId || '').trim();
    const { sortKey, direction } = this._buildSort(
      filters.sortBy,
      filters.sortOrder
    );

    const digitalQuery = { patient_id: customerId };
    const uploadedQuery = { patient_id: customerId };

    if (fromDate || toDate) {
      const range = {};
      if (fromDate) range.$gte = fromDate;
      if (toDate) range.$lte = toDate;
      digitalQuery.created_at = range;
      uploadedQuery.created_at = range;
    }

    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      digitalQuery.doctor_id = doctorId;
    }

    const doctorSearchClause = search
      ? {
          $or: [
            {
              diagnosis_reason: {
                $regex: this._escapeRegex(search),
                $options: 'i',
              },
            },
            {
              special_instructions: {
                $regex: this._escapeRegex(search),
                $options: 'i',
              },
            },
          ],
        }
      : null;

    if (doctorSearchClause) {
      digitalQuery.$and = [doctorSearchClause];
    }

    const [digitalPrescriptions, uploadedPrescriptions] = await Promise.all([
      type === 'uploaded'
        ? []
        : PrescriptionGeneratedByDoctor.find(digitalQuery)
            .populate(
              'doctor_id',
              'fullName first_name last_name specialization profile_img_url consultation_fee'
            )
            .populate('appointment_id', 'status appointment_type created_at')
            .populate({
              path: 'prescription_items_ids',
              populate: {
                path: 'medicine_id',
                select: 'Name name alias_name sale_price prescription_required',
              },
            })
            .sort({ [sortKey]: direction })
            .lean(),
      type === 'digital'
        ? []
        : PrescriptionUploadedByCustomer.find(uploadedQuery)
            .sort({ [sortKey]: direction })
            .lean(),
    ]);

    const digitalList = digitalPrescriptions.map(item =>
      this._mapDigitalPrescription(item)
    );
    const uploadedList = uploadedPrescriptions.map(item =>
      this._mapUploadedPrescription(item)
    );

    let prescriptions = [];
    if (type === 'digital') {
      prescriptions = digitalList;
    } else if (type === 'uploaded') {
      prescriptions = uploadedList;
    } else {
      prescriptions = [...digitalList, ...uploadedList];
    }

    if (search) {
      const normalizedSearch = search.toLowerCase();
      prescriptions = prescriptions.filter(item => {
        const doctorName = item.doctor?.fullName?.toLowerCase() || '';
        const diagnosis = item.diagnosis_reason?.toLowerCase() || '';
        const notes = item.special_instructions?.toLowerCase() || '';
        const id = String(item._id || '').toLowerCase();
        const uploadedNotes = item.notes?.toLowerCase() || '';
        return (
          id.includes(normalizedSearch) ||
          doctorName.includes(normalizedSearch) ||
          diagnosis.includes(normalizedSearch) ||
          notes.includes(normalizedSearch) ||
          uploadedNotes.includes(normalizedSearch)
        );
      });
    }

    if (doctorId) {
      prescriptions = prescriptions.filter(
        item => String(item.doctor?._id || '') === doctorId
      );
    }

    prescriptions = this._sortCombinedPrescriptions(
      prescriptions,
      sortKey,
      direction
    );

    const totalPrescriptions = prescriptions.length;
    const totalPages = Math.ceil(totalPrescriptions / limit);
    const startIndex = (page - 1) * limit;
    const paginated = prescriptions.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        prescriptions: paginated,
        pagination: {
          currentPage: page,
          totalPages,
          totalPrescriptions,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        appliedFilters: {
          search: search || null,
          type,
          doctorId: doctorId || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          sortBy: sortKey,
          sortOrder: direction === 1 ? 'asc' : 'desc',
        },
      },
    };
  }

  async getPrescriptionStats(customerId) {
    const [
      digitalCount,
      uploadedCount,
      activeDigitalCount,
      expiredDigitalCount,
    ] = await Promise.all([
      PrescriptionGeneratedByDoctor.countDocuments({ patient_id: customerId }),
      PrescriptionUploadedByCustomer.countDocuments({ patient_id: customerId }),
      PrescriptionGeneratedByDoctor.countDocuments({
        patient_id: customerId,
        valid_till: { $gte: new Date() },
      }),
      PrescriptionGeneratedByDoctor.countDocuments({
        patient_id: customerId,
        valid_till: { $lt: new Date() },
      }),
    ]);

    return {
      success: true,
      data: {
        total_prescriptions: digitalCount + uploadedCount,
        digital_prescriptions: digitalCount,
        uploaded_prescriptions: uploadedCount,
        active_digital_prescriptions: activeDigitalCount,
        expired_digital_prescriptions: expiredDigitalCount,
      },
    };
  }

  async getUploadedPrescriptions(customerId, filters = {}) {
    const page = this._parsePositiveInt(filters.page, 1);
    const limit = this._parsePositiveInt(filters.limit, 10);
    const [uploads, total] = await Promise.all([
      PrescriptionUploadedByCustomer.find({ patient_id: customerId })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PrescriptionUploadedByCustomer.countDocuments({ patient_id: customerId }),
    ]);

    return {
      success: true,
      data: {
        prescriptions: uploads.map(item => this._mapUploadedPrescription(item)),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPrescriptions: total,
          itemsPerPage: limit,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  }

  async uploadPrescription(customerId, file, payload = {}) {
    if (!file) {
      throw new Error('PRESCRIPTION_FILE_REQUIRED');
    }

    let branchId = null;
    let salespersonId = null;

    if (payload.orderId && mongoose.Types.ObjectId.isValid(payload.orderId)) {
      const order = await Order.findOne({
        _id: payload.orderId,
        customer_id: customerId,
      })
        .select('branch_id salesperson_id')
        .lean();

      if (order) {
        branchId = order.branch_id || null;
        salespersonId = order.salesperson_id || null;

        if (!salespersonId && branchId) {
          const branch = await Branch.findById(branchId)
            .select('salespersons_assigned salesperson_assignment_cursor')
            .lean();

          const salespersons =
            branch?.salespersons_assigned
              ?.map(id => id.toString())
              .filter(Boolean) || [];
          if (salespersons.length) {
            const cursor = Number(branch?.salesperson_assignment_cursor || 0);
            salespersonId = salespersons[cursor % salespersons.length];
          }
        }
      }
    }

    const prescriptionUrl = await uploadToCloudinary(
      file.path,
      'customer/prescriptions'
    );

    const record = await PrescriptionUploadedByCustomer.create({
      patient_id: customerId,
      prescription_url: prescriptionUrl,
      prescription_type: payload.prescriptionType || 'general',
      order_id: payload.orderId || undefined,
      branch_id: branchId || undefined,
      salesperson_id: salespersonId || undefined,
      review_status: 'pending',
      notes: payload.notes || undefined,
    });

    const recordObject = record.toObject();
    await this._notifyUploadedPrescriptionReviewTarget(recordObject);

    return {
      success: true,
      data: this._mapUploadedPrescription(recordObject),
    };
  }

  async getPrescriptionDetails(customerId, prescriptionId) {
    const idQuery = mongoose.Types.ObjectId.isValid(prescriptionId)
      ? prescriptionId
      : null;

    if (!idQuery) {
      throw new Error('PRESCRIPTION_NOT_FOUND');
    }

    const digital = await PrescriptionGeneratedByDoctor.findOne({
      _id: idQuery,
      patient_id: customerId,
    })
      .populate(
        'doctor_id',
        'fullName first_name last_name specialization profile_img_url consultation_fee license_number email'
      )
      .populate(
        'appointment_id',
        'status appointment_type created_at preferred_date preferred_time'
      )
      .populate({
        path: 'prescription_items_ids',
        populate: {
          path: 'medicine_id',
          select:
            'Name name alias_name sale_price prescription_required mgs dosage_form description img_urls',
        },
      })
      .lean();

    if (digital) {
      return {
        success: true,
        data: {
          prescription: this._mapDigitalPrescription(digital),
        },
      };
    }

    const uploaded = await PrescriptionUploadedByCustomer.findOne({
      _id: idQuery,
      patient_id: customerId,
    }).lean();

    if (uploaded) {
      return {
        success: true,
        data: {
          prescription: this._mapUploadedPrescription(uploaded),
        },
      };
    }

    throw new Error('PRESCRIPTION_NOT_FOUND');
  }

  async getPrescriptionPDF(customerId, prescriptionId) {
    const details = await this.getPrescriptionDetails(
      customerId,
      prescriptionId
    );
    const prescription = details.data.prescription;

    if (prescription.source === 'uploaded') {
      return {
        success: true,
        data: {
          pdfUrl: prescription.prescription_url,
          originalUrl: prescription.prescription_url,
        },
      };
    }

    return {
      success: true,
      data: {
        pdfUrl: prescription.file_url,
        originalUrl: prescription.file_url,
      },
    };
  }

  async addPrescriptionMedicinesToCart(customerId, prescriptionId) {
    const digitalPrescription = await PrescriptionGeneratedByDoctor.findOne({
      _id: prescriptionId,
      patient_id: customerId,
    })
      .populate({
        path: 'prescription_items_ids',
        populate: {
          path: 'medicine_id',
          select: '_id Name sale_price active prescription_required',
        },
      })
      .lean();

    if (digitalPrescription) {
      const items = Array.isArray(digitalPrescription.prescription_items_ids)
        ? digitalPrescription.prescription_items_ids
        : [];

      if (!items.length) {
        throw new Error('PRESCRIPTION_HAS_NO_MEDICINES');
      }

      const addedItems = [];

      for (const item of items) {
        const medicineId = item.medicine_id?._id || item.medicine_id;
        if (!medicineId) continue;

        const quantity = Number(item.quantity_prescribed || 1);
        const cartResult = await cartService.addToCart(customerId, {
          medicineId,
          quantity,
        });

        addedItems.push({
          medicine_id: medicineId,
          medicine_name: item.medicine_id?.Name || 'Medicine',
          quantity,
          cart_summary: cartResult,
        });
      }

      await logCustomerActivity(
        null,
        'order_from_prescription',
        `Added medicines from prescription ${prescriptionId} to cart`,
        'prescriptions',
        prescriptionId,
        {
          customer_id: customerId,
          medicine_count: addedItems.length,
        }
      );

      return {
        success: true,
        data: {
          prescription_id: prescriptionId,
          added_items: addedItems,
          item_count: addedItems.length,
          source: 'digital',
        },
      };
    }

    const uploadedPrescription = await PrescriptionUploadedByCustomer.findOne({
      _id: prescriptionId,
      patient_id: customerId,
    }).lean();

    if (!uploadedPrescription) {
      throw new Error('PRESCRIPTION_NOT_FOUND');
    }

    if (uploadedPrescription.review_status !== 'approved') {
      throw new Error('PRESCRIPTION_NOT_APPROVED');
    }

    const approvalItems = this._normalizeApprovalPayload(
      uploadedPrescription.allow_payload || {}
    ).items;

    if (!approvalItems.length) {
      throw new Error('PRESCRIPTION_ALLOW_PAYLOAD_EMPTY');
    }

    const addedItems = [];

    for (const item of approvalItems) {
      const cartResult = await cartService.addToCart(customerId, {
        medicineId: item.medicine_id,
        quantity: item.quantity,
      });

      const medicine = await Medicine.findById(item.medicine_id)
        .select('Name')
        .lean();

      addedItems.push({
        medicine_id: item.medicine_id,
        medicine_name: medicine?.Name || item.medicine_name || 'Medicine',
        quantity: item.quantity,
        cart_summary: cartResult,
      });
    }

    await logCustomerActivity(
      null,
      'order_from_prescription',
      `Added allowed medicines from uploaded prescription ${prescriptionId} to cart`,
      'prescriptions',
      prescriptionId,
      {
        customer_id: customerId,
        medicine_count: addedItems.length,
      }
    );

    return {
      success: true,
      data: {
        prescription_id: prescriptionId,
        added_items: addedItems,
        item_count: addedItems.length,
        source: 'uploaded',
        allow_payload: uploadedPrescription.allow_payload || null,
      },
    };
  }
}

export default new CustomerPrescriptionsService();
