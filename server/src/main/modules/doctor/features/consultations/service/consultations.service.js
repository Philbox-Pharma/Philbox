import mongoose from 'mongoose';
import Appointment from '../../../../../models/Appointment.js';
import PrescriptionGeneratedByDoctor from '../../../../../models/PrescriptionGeneratedByDoctor.js';
import AppointmentMessage from '../../../../../models/AppointmentMessage.js';
import Patient from '../../../../../models/Patient.js';

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
              select: 'name generic_name manufacturer strength form',
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
            select: 'name generic_name manufacturer strength form',
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
}

// Export singleton instance
const doctorConsultationsService = new DoctorConsultationsService();
export default doctorConsultationsService;
