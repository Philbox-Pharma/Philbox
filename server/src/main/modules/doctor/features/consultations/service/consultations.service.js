import mongoose from 'mongoose';
import Appointment from '../../../../../models/Appointment.js';
import PrescriptionGeneratedByDoctor from '../../../../../models/PrescriptionGeneratedByDoctor.js';
import '../../../../../models/PrescriptionItem.js';
import '../../../../../models/Medicine.js';
import PrescriptionUploadedByCustomer from '../../../../../models/PrescriptionUploadedByCustomer.js';

import AppointmentMessage from '../../../../../models/AppointmentMessage.js';
import Patient from '../../../../../models/Patient.js';

import Customer from '../../../../../models/Customer.js';
import doctorConsultationService from '../../../../shared/consultations/service/doctorConsultation.service.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import cloudinary from '../../../../../config/cloudinary.config.js';

import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseCloudinaryAssetInfo = fileUrl => {
  try {
    const urlObj = new URL(fileUrl);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) {
      return null;
    }

    const afterUpload = parts.slice(uploadIndex + 1);
    const hasVersion = /^v\d+$/.test(afterUpload[0]);
    const version = hasVersion ? afterUpload[0].slice(1) : undefined;
    const publicIdWithExt = hasVersion
      ? afterUpload.slice(1).join('/')
      : afterUpload.join('/');

    if (!publicIdWithExt) {
      return null;
    }

    const publicId = publicIdWithExt.replace(/\.pdf$/i, '');

    return { publicId, publicIdWithExt, version };
  } catch {
    return null;
  }
};

const canAccessUrl = async url => {
  try {
    const headRes = await fetch(url, { method: 'HEAD' });
    if (headRes.ok) return true;

    if (headRes.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-32' },
      });
      return getRes.ok || getRes.status === 206;
    }

    return false;
  } catch {
    return false;
  }
};

const buildAccessibleConsultationPdfUrl = async fileUrl => {
  if (!fileUrl) return null;

  const assetInfo = parseCloudinaryAssetInfo(fileUrl);
  if (!assetInfo) {
    return fileUrl;
  }

  const { publicId, publicIdWithExt, version } = assetInfo;
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

  const candidates = [
    cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
    }),
    cloudinary.utils.private_download_url(publicIdWithExt, null, {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
    }),
    cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      sign_url: true,
      version,
      format: 'pdf',
    }),
    cloudinary.url(publicIdWithExt, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      sign_url: true,
      version,
    }),
    fileUrl,
  ];

  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const candidate of uniqueCandidates) {
    if (await canAccessUrl(candidate)) {
      return candidate;
    }
  }

  return fileUrl;
};

class DoctorConsultationsService {
  /**
   * Get past consultations (completed appointments) with filters
   */
  async getPastConsultations(doctorId, filters) {
    try {
      const {
        page = 1,
        limit = 10,
        patient_name,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build query for completed appointments
      const query = {
        doctor_id: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
        appointment_request: 'accepted',
      };

      // Apply date filters
      if (start_date || end_date) {
        query.created_at = {};
        if (start_date) {
          query.created_at.$gte = new Date(start_date);
        }
        if (end_date) {
          query.created_at.$lte = new Date(end_date);
        }
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      // Execute query with pagination
      let appointmentsQuery = Appointment.find(query)
        .select('-doctor_id -__v')
        .populate('patient_id', 'fullName email contactNumber profile_img_url')
        .populate('slot_id', 'date start_time end_time slot_duration')
        .populate(
          'prescription_generated',
          'diagnosis_reason file_url digital_verification_id special_instructions valid_till created_at'
        )
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean();

      // If patient name filter is provided, we need to filter after populate
      let appointments = await appointmentsQuery;

      // Fetch patient medical data for all customers
      const customerIds = appointments
        .map(apt => apt.patient_id?._id)
        .filter(Boolean);
      const patients = await Patient.find({
        customer_id: { $in: customerIds },
      }).lean();

      // Create a map of customer_id to patient data
      const patientMap = new Map();
      patients.forEach(patient => {
        patientMap.set(patient.customer_id.toString(), patient);
      });

      // Merge patient medical data with customer data
      appointments = appointments.map(apt => {
        if (apt.patient_id) {
          const patientData = patientMap.get(apt.patient_id._id.toString());
          if (patientData) {
            apt.patient_id = {
              ...apt.patient_id,
              blood_group: patientData.blood_group,
              weight: patientData.weight,
              height: patientData.height,
              patient_status: patientData.status,
            };
          }
        }

        // Ensure key fields always present even if null
        return {
          ...apt,
          recording_url: apt.recording_url || null,
          slot_id: apt.slot_id || null,
          consultation_reason: apt.consultation_reason || null,
          notes: apt.notes || null,
        };
      });

      // Filter by patient name if provided
      if (patient_name) {
        const searchTerm = patient_name.toLowerCase();
        appointments = appointments.filter(apt => {
          if (!apt.patient_id) return false;
          const fullName = apt.patient_id.fullName?.toLowerCase() || '';
          return fullName.includes(searchTerm);
        });
      }

      // Get total count (without patient name filter for simplicity)
      const total = await Appointment.countDocuments(query);

      const totalPages = Math.ceil(total / limit);

      return {
        consultations: appointments,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error in getPastConsultations:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific consultation
   */
  async getConsultationDetails(doctorId, consultationId) {
    try {
      // Get appointment with all related data
      const appointment = await Appointment.findOne({
        _id: consultationId,
        doctor_id: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
      })
        .select('-doctor_id -__v')
        .populate(
          'patient_id',
          'fullName email contactNumber profile_img_url dateOfBirth gender'
        )
        .populate('slot_id', 'date start_time end_time slot_duration')
        .populate(
          'prescription_generated',
          'diagnosis_reason file_url digital_verification_id special_instructions valid_till created_at'
        )
        .lean();

      if (!appointment) {
        throw new Error('CONSULTATION_NOT_FOUND');
      }

      // Fetch patient medical data
      if (appointment.patient_id) {
        const patientData = await Patient.findOne({
          customer_id: appointment.patient_id._id,
        }).lean();

        if (patientData) {
          appointment.patient_id = {
            ...appointment.patient_id,
            blood_group: patientData.blood_group,
            weight: patientData.weight,
            height: patientData.height,
            patient_status: patientData.status,
          };
        }
      }

      // Get prescription details with items if prescription exists
      let prescriptionDetails = null;
      if (appointment.prescription_generated) {
        const prescription = await PrescriptionGeneratedByDoctor.findById(
          appointment.prescription_generated._id
        )
          .select('-doctor_id -__v')
          .populate({
            path: 'prescription_items_ids',
            populate: {
              path: 'medicine_id',
              select: 'Name',
            },
          })
          .lean();

        prescriptionDetails = prescription;
      }

      // Get consultation messages/notes
      const messages = await AppointmentMessage.find({
        appointment_id: consultationId,
      })
        .sort({ created_at: 1 })
        .lean();

      return {
        appointment,
        prescription: prescriptionDetails,
        messages,
      };
    } catch (error) {
      console.error('Error in getConsultationDetails:', error);
      throw error;
    }
  }

  /**
   * Get prescription details for a consultation
   */
  async getPrescriptionDetails(doctorId, prescriptionId) {
    try {
      const prescription = await PrescriptionGeneratedByDoctor.findOne({
        _id: prescriptionId,
        doctor_id: new mongoose.Types.ObjectId(doctorId),
      })
        .select('-doctor_id -__v')
        .populate('patient_id', 'fullName email contactNumber')
        .populate('appointment_id', 'appointment_type consultation_reason')
        .populate({
          path: 'prescription_items_ids',
          populate: {
            path: 'medicine_id',
            select: 'Name',
          },
        })
        .lean();

      if (!prescription) {
        throw new Error('PRESCRIPTION_NOT_FOUND');
      }

      // Fetch patient medical data
      if (prescription.patient_id) {
        const patientData = await Patient.findOne({
          customer_id: prescription.patient_id._id,
        }).lean();

        if (patientData) {
          prescription.patient_id = {
            ...prescription.patient_id,
            blood_group: patientData.blood_group,
            weight: patientData.weight,
            height: patientData.height,
            patient_status: patientData.status,
          };
        }
      }

      return prescription;
    } catch (error) {
      console.error('Error in getPrescriptionDetails:', error);
      throw error;
    }
  }

  /**
   * Get consultation statistics
   */
  async getConsultationStats(doctorId, filters = {}) {
    try {
      const { start_date, end_date } = filters;

      const query = {
        doctor_id: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
        appointment_request: 'accepted',
      };

      if (start_date || end_date) {
        query.created_at = {};
        if (start_date) {
          query.created_at.$gte = new Date(start_date);
        }
        if (end_date) {
          query.created_at.$lte = new Date(end_date);
        }
      }

      const totalConsultations = await Appointment.countDocuments(query);

      // Count consultations with prescriptions
      const withPrescriptions = await Appointment.countDocuments({
        ...query,
        prescription_generated: { $exists: true, $ne: null },
      });

      // Count consultations with recordings
      const withRecordings = await Appointment.countDocuments({
        ...query,
        recording_url: { $exists: true, $ne: null, $ne: '' },
      });

      // Get appointment type distribution
      const typeDistribution = await Appointment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$appointment_type',
            count: { $sum: 1 },
          },
        },
      ]);

      const types = {
        'in-person': 0,
        online: 0,
      };

      typeDistribution.forEach(item => {
        types[item._id] = item.count;
      });

      return {
        total_consultations: totalConsultations,
        with_prescriptions: withPrescriptions,
        with_recordings: withRecordings,
        appointment_types: types,
      };
    } catch (error) {
      console.error('Error in getConsultationStats:', error);
      throw error;
    }
  }

  /**
   * Get patient medical history from consultation context
   * @param {Object} req - Express request object
   * @param {String} consultationId - The appointment/consultation ID
   * @param {String} startDate - Optional start date filter
   * @param {String} endDate - Optional end date filter
   * @returns {Object} - Aggregated medical history
   */
  async getPatientHistoryFromConsultation(
    req,
    consultationId,
    startDate,
    endDate
  ) {
    try {
      const doctorId = req.doctor._id;

      // Step 1: Fetch the consultation/appointment to get patient ID
      const consultation = await Appointment.findById(consultationId).lean();

      if (!consultation) {
        throw new Error('CONSULTATION_NOT_FOUND: Consultation not found');
      }

      // Step 2: Verify the doctor owns this consultation
      if (consultation.doctor_id.toString() !== doctorId.toString()) {
        throw new Error(
          'UNAUTHORIZED_ACCESS: You do not have access to this consultation'
        );
      }

      // Step 3: Get patient ID
      const patientId = consultation.patient_id;

      // Step 4: Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.created_at = {};
        if (startDate) {
          dateFilter.created_at.$gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.created_at.$lte = new Date(endDate);
        }
      }

      // Step 5: Fetch patient information
      const patientInfo = await Customer.findById(patientId)
        .select(
          'fullName email gender dateOfBirth contactNumber profile_img_url'
        )
        .lean();

      if (!patientInfo) {
        throw new Error('PATIENT_NOT_FOUND: Patient not found');
      }

      // Step 6: Fetch all medical data in parallel
      const [appointments, doctorPrescriptions, uploadedPrescriptions, orders] =
        await Promise.all([
          // Fetch appointments
          Appointment.find({
            patient_id: patientId,
            status: { $in: ['completed', 'missed'] },
            ...dateFilter,
          })
            .populate('doctor_id', 'fullName email specialization')
            .populate('slot_id')
            .sort({ created_at: -1 })
            .lean(),

          // Fetch doctor prescriptions
          PrescriptionGeneratedByDoctor.find({
            patient_id: patientId,
            ...dateFilter,
          })
            .populate('doctor_id', 'fullName email specialization')
            .populate('appointment_id', 'appointment_type status')
            .populate({
              path: 'prescription_items_ids',
              populate: {
                path: 'medicine_id',
                select: 'Name',
              },
            })
            .sort({ created_at: -1 })
            .lean(),

          // Fetch uploaded prescriptions
          PrescriptionUploadedByCustomer.find({
            patient_id: patientId,
            ...dateFilter,
          })
            .populate('order_id', 'status total')
            .sort({ created_at: -1 })
            .lean(),

          // Fetch orders
          Order.find({
            customer_id: patientId,
            ...dateFilter,
          })
            .populate({
              path: 'order_items',
              populate: {
                path: 'medicine_id',
                select: 'Name sale_price',
              },
            })
            .populate('branch_id', 'name address')
            .populate('salesperson_id', 'fullName')
            .sort({ created_at: -1 })
            .lean(),
        ]);

      // Step 7: Extract medical notes from appointments
      const medicalNotes = appointments
        .filter(apt => apt.notes && apt.notes.trim() !== '')
        .map(apt => ({
          appointment_id: apt._id,
          appointment_date: apt.created_at,
          appointment_type: apt.appointment_type,
          notes: apt.notes,
          doctor: apt.doctor_id,
        }));

      // Step 8: Log the access for compliance
      await logDoctorActivity(
        req,
        'view_medical_history_from_consultation',
        `Viewed medical history for patient: ${patientInfo.fullName} via consultation: ${consultationId}`,
        'customers',
        patientId,
        {
          consultation_id: consultationId,
          filters: { startDate, endDate },
          data_accessed: {
            appointments_count: appointments.length,
            prescriptions_count: doctorPrescriptions.length,
            uploaded_prescriptions_count: uploadedPrescriptions.length,
            orders_count: orders.length,
          },
        }
      );

      // Step 9: Return aggregated data
      return {
        patient: patientInfo,
        summary: {
          total_appointments: appointments.length,
          total_prescriptions_generated: doctorPrescriptions.length,
          total_prescriptions_uploaded: uploadedPrescriptions.length,
          total_orders: orders.length,
          total_medical_notes: medicalNotes.length,
        },
        history: {
          appointments,
          prescriptions_generated_by_doctor: doctorPrescriptions,
          prescriptions_uploaded_by_patient: uploadedPrescriptions,
          orders,
          medical_notes: medicalNotes,
        },
      };
    } catch (error) {
      console.error('Error in getPatientHistoryFromConsultation:', error);
      throw error;
    }
  }

  async getConsultationSession(doctorId, consultationId) {
    return doctorConsultationService.getConsultationSession(
      doctorId,
      consultationId
    );
  }

  async startConsultation(doctorId, consultationId) {
    return doctorConsultationService.startConsultation(
      doctorId,
      consultationId
    );
  }

  async endConsultation(doctorId, consultationId, payload = {}) {
    return doctorConsultationService.endConsultation(
      doctorId,
      consultationId,
      payload
    );
  }

  async updateRecordingUrl(doctorId, consultationId, recordingUrl) {
    return doctorConsultationService.updateRecordingUrl(
      doctorId,
      consultationId,
      recordingUrl
    );
  }

  async listConsultationMessages(doctorId, consultationId, filters = {}) {
    return doctorConsultationService.listConsultationMessages(
      doctorId,
      consultationId,
      filters
    );
  }

  async sendConsultationMessage(doctorId, consultationId, payload = {}) {
    return doctorConsultationService.sendConsultationMessage(
      doctorId,
      consultationId,
      payload
    );
  }

  async exportConsultationHistory(doctorId, filters = {}, doctorInfo = null) {
    try {
      const {
        patient_name,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = filters;

      const query = {
        doctor_id: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
        appointment_request: 'accepted',
      };

      if (start_date || end_date) {
        query.created_at = {};
        if (start_date) {
          query.created_at.$gte = new Date(start_date);
        }
        if (end_date) {
          query.created_at.$lte = new Date(end_date);
        }
      }

      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      let consultations = await Appointment.find(query)
        .select('-doctor_id -__v')
        .populate('patient_id', 'fullName email contactNumber profile_img_url')
        .populate('slot_id', 'date start_time end_time slot_duration')
        .populate(
          'prescription_generated',
          'diagnosis_reason file_url digital_verification_id special_instructions valid_till created_at'
        )
        .sort(sortObj)
        .lean();

      const patientIds = consultations
        .map(consultation => consultation.patient_id?._id)
        .filter(Boolean);

      const patientRecords = await Patient.find({
        customer_id: { $in: patientIds },
      }).lean();

      const patientMap = new Map();
      patientRecords.forEach(patient => {
        patientMap.set(patient.customer_id.toString(), patient);
      });

      consultations = consultations.map(consultation => {
        if (consultation.patient_id) {
          const patientData = patientMap.get(
            consultation.patient_id._id.toString()
          );

          if (patientData) {
            consultation.patient_id = {
              ...consultation.patient_id,
              blood_group: patientData.blood_group,
              weight: patientData.weight,
              height: patientData.height,
              patient_status: patientData.status,
            };
          }
        }

        return {
          ...consultation,
          recording_url: consultation.recording_url || null,
          slot_id: consultation.slot_id || null,
          consultation_reason: consultation.consultation_reason || null,
          notes: consultation.notes || null,
        };
      });

      if (patient_name) {
        const searchTerm = patient_name.toLowerCase();
        consultations = consultations.filter(consultation => {
          if (!consultation.patient_id) return false;

          const fullName =
            consultation.patient_id.fullName?.toLowerCase() || '';
          return fullName.includes(searchTerm);
        });
      }

      const summary = {
        total_consultations: consultations.length,
        in_person_consultations: consultations.filter(
          consultation => consultation.appointment_type === 'in-person'
        ).length,
        online_consultations: consultations.filter(
          consultation => consultation.appointment_type === 'online'
        ).length,
        consultations_with_prescriptions: consultations.filter(
          consultation => consultation.prescription_generated
        ).length,
        consultations_with_recordings: consultations.filter(
          consultation => consultation.recording_url
        ).length,
      };

      const pdfUrl = await generateConsultationHistoryPDF({
        doctorName: doctorInfo?.fullName || doctorInfo?.name || 'Doctor',
        consultations,
        filters,
        summary,
      });

      const accessiblePdfUrl = await buildAccessibleConsultationPdfUrl(pdfUrl);

      return {
        pdf_url: accessiblePdfUrl,
        original_url: pdfUrl,
        total_consultations: consultations.length,
        summary,
      };
    } catch (error) {
      console.error('Error in exportConsultationHistory:', error);
      throw error;
    }
  }
}

// Export singleton instance
const doctorConsultationsService = new DoctorConsultationsService();
export default doctorConsultationsService;

const formatPdfDate = value => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const generateConsultationHistoryPDF = async ({
  doctorName,
  consultations,
  filters,
  summary,
}) => {
  try {
    const tempDir = path.join(__dirname, '../../../../../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `consultation_history_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const addTableHeader = () => {
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Date', 40, tableTop, { width: 70 });
      doc.text('Patient', 110, tableTop, { width: 150 });
      doc.text('Type', 260, tableTop, { width: 70 });
      doc.text('Status', 330, tableTop, { width: 70 });
      doc.text('Rx', 400, tableTop, { width: 45 });
      doc.text('Recording', 445, tableTop, { width: 150 });

      doc
        .strokeColor('#d1d5db')
        .lineWidth(0.5)
        .moveTo(40, doc.y + 2)
        .lineTo(555, doc.y + 2)
        .stroke();

      doc.moveDown(0.8);
      doc.font('Helvetica');
    };

    const ensurePageSpace = requiredSpace => {
      if (doc.y + requiredSpace > 760) {
        doc.addPage();
        addTableHeader();
      }
    };

    doc.fontSize(20).font('Helvetica-Bold').text('CONSULTATION HISTORY', {
      align: 'center',
    });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#555555');
    doc.text(`Doctor: ${doctorName}`, { align: 'center' });
    doc.text(`Generated: ${formatPdfDate(new Date())}`, { align: 'center' });
    doc.moveDown(1);

    doc
      .fillColor('#000000')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('SUMMARY', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total consultations: ${summary.total_consultations}`);
    doc.text(`In-person consultations: ${summary.in_person_consultations}`);
    doc.text(`Online consultations: ${summary.online_consultations}`);
    doc.text(
      `Consultations with prescriptions: ${summary.consultations_with_prescriptions}`
    );
    doc.text(
      `Consultations with recordings: ${summary.consultations_with_recordings}`
    );
    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('FILTERS', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica');
    doc.text(`Patient name: ${filters.patient_name || 'All'}`);
    doc.text(`Start date: ${filters.start_date || 'All'}`);
    doc.text(`End date: ${filters.end_date || 'All'}`);
    doc.text(`Sort by: ${filters.sort_by || 'created_at'}`);
    doc.text(`Sort order: ${filters.sort_order || 'desc'}`);
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica-Bold').text('CONSULTATIONS', {
      underline: true,
    });
    doc.moveDown(0.5);

    addTableHeader();

    consultations.forEach(consultation => {
      ensurePageSpace(32);

      const rowY = doc.y;
      const patientName = consultation.patient_id?.fullName || 'N/A';
      const hasPrescription = consultation.prescription_generated
        ? 'Yes'
        : 'No';
      const hasRecording = consultation.recording_url ? 'Yes' : 'No';

      doc.fontSize(8).font('Helvetica');
      doc.text(formatPdfDate(consultation.created_at), 40, rowY, { width: 70 });
      doc.text(patientName, 110, rowY, { width: 145 });
      doc.text(consultation.appointment_type || 'N/A', 260, rowY, {
        width: 70,
      });
      doc.text(consultation.status || 'N/A', 330, rowY, { width: 70 });
      doc.text(hasPrescription, 400, rowY, { width: 45 });
      doc.text(hasRecording, 445, rowY, { width: 150 });

      doc.y = rowY + 16;
    });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const cloudinaryUrl = await uploadToCloudinary(
      filePath,
      'consultations/pdfs',
      {
        resource_type: 'raw',
        type: 'upload',
        invalidate: true,
      }
    );

    return cloudinaryUrl;
  } catch (error) {
    console.error('Consultation history PDF generation error:', error);
    throw new Error(
      `Failed to generate consultation history PDF: ${error.message}`
    );
  }
};
