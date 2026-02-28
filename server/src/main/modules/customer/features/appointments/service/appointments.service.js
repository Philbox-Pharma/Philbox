import Appointment from '../../../../../models/Appointment.js';
import DoctorSlot from '../../../../../models/DoctorSlot.js';
import Doctor from '../../../../../models/Doctor.js';
import Customer from '../../../../../models/Customer.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import {
  sendAppointmentRequestSubmitted,
  sendNewAppointmentRequestNotification,
} from '../../../../../utils/sendEmail.js';

class CustomerAppointmentsService {
  /**
   * Create a new appointment request
   */
  async createAppointmentRequest(customerId, requestData, req) {
    try {
      const {
        doctor_id,
        slot_id,
        appointment_type,
        consultation_reason,
        preferred_date,
        preferred_time,
      } = requestData;

      // Validate doctor exists and is active
      const doctor = await Doctor.findOne({
        _id: doctor_id,
        account_status: 'active',
      });

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND_OR_INACTIVE');
      }

      // Get customer details
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }

      // If slot_id is provided, validate the slot
      if (slot_id) {
        const slot = await DoctorSlot.findOne({
          _id: slot_id,
          doctor_id: doctor_id,
          status: 'available',
          date: { $gte: new Date() }, // Only future slots
        });

        if (!slot) {
          throw new Error('SLOT_NOT_AVAILABLE');
        }
      }

      // Create the appointment request
      const appointment = await Appointment.create({
        doctor_id,
        patient_id: customerId,
        slot_id: slot_id || null,
        appointment_type,
        consultation_reason,
        preferred_date: preferred_date ? new Date(preferred_date) : null,
        preferred_time: preferred_time || null,
        appointment_request: 'processing',
        status: 'pending',
      });

      // Log activity
      await logCustomerActivity(
        req,
        'appointment_request_create',
        `Created appointment request with Dr. ${doctor.first_name} ${doctor.last_name}`,
        'appointments',
        appointment._id,
        {
          doctor_id,
          appointment_type,
          consultation_reason,
        }
      );

      // Send email notification to customer (confirmation)
      try {
        const doctorName = `${doctor.first_name} ${doctor.last_name}`;
        const customerName = `${customer.first_name} ${customer.last_name}`;

        let preferredDateTime = 'Not specified';
        if (preferred_date) {
          preferredDateTime = new Date(preferred_date).toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          );
          if (preferred_time) {
            preferredDateTime += ` at ${preferred_time}`;
          }
        }

        await sendAppointmentRequestSubmitted(
          customer.email,
          customerName,
          doctorName,
          appointment_type,
          preferredDateTime,
          doctor.consultation_fee || 0
        );
      } catch (emailError) {
        console.error(
          'Error sending appointment request submitted email:',
          emailError
        );
      }

      // Send email notification to doctor (new request)
      try {
        const doctorName = `${doctor.first_name} ${doctor.last_name}`;
        const customerName = `${customer.first_name} ${customer.last_name}`;

        let preferredDateTime = 'Not specified';
        if (preferred_date) {
          preferredDateTime = new Date(preferred_date).toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          );
          if (preferred_time) {
            preferredDateTime += ` at ${preferred_time}`;
          }
        }

        const requestDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/appointments/requests`;

        await sendNewAppointmentRequestNotification(
          doctor.email,
          doctorName,
          customerName,
          appointment_type,
          preferredDateTime,
          consultation_reason,
          requestDate,
          dashboardLink
        );
      } catch (emailError) {
        console.error(
          'Error sending new appointment request notification:',
          emailError
        );
      }

      // Populate and return the appointment
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate(
          'doctor_id',
          'first_name last_name email consultation_fee specialization'
        )
        .populate('slot_id', 'date start_time end_time')
        .lean();

      return populatedAppointment;
    } catch (error) {
      console.error('Error in createAppointmentRequest:', error);
      throw error;
    }
  }

  /**
   * Get customer's appointment requests with pagination and filters
   */
  async getMyRequests(customerId, filters) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'processing',
        appointment_type,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build query
      const query = {
        patient_id: customerId,
      };

      if (status) {
        query.appointment_request = status;
      }

      if (appointment_type) {
        query.appointment_type = appointment_type;
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate(
            'doctor_id',
            'first_name last_name email consultation_fee specialization profile_picture'
          )
          .populate('slot_id', 'date start_time end_time')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Appointment.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        appointments,
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
      console.error('Error in getMyRequests:', error);
      throw error;
    }
  }

  /**
   * Get appointment request details
   */
  async getRequestStatus(customerId, appointmentId) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient_id: customerId,
      })
        .populate(
          'doctor_id',
          'first_name last_name email consultation_fee specialization profile_picture'
        )
        .populate('slot_id', 'date start_time end_time')
        .lean();

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      return appointment;
    } catch (error) {
      console.error('Error in getRequestStatus:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment request
   */
  async cancelRequest(customerId, appointmentId, cancelData, req) {
    try {
      const { cancellation_reason } = cancelData;

      // Find the appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient_id: customerId,
        appointment_request: 'processing', // Can only cancel processing requests
      })
        .populate('doctor_id', 'first_name last_name email')
        .populate('patient_id', 'first_name last_name');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND_OR_ALREADY_PROCESSED');
      }

      // If there's a slot associated, free it up
      if (appointment.slot_id) {
        const slot = await DoctorSlot.findById(appointment.slot_id);
        if (slot && slot.status === 'booked') {
          slot.status = 'available';
          await slot.save();
        }
      }

      // Update appointment status
      appointment.appointment_request = 'cancelled';
      if (cancellation_reason) {
        appointment.cancellation_reason = cancellation_reason;
      }

      await appointment.save();

      // Log activity
      await logCustomerActivity(
        req,
        'appointment_request_cancel',
        `Cancelled appointment request with Dr. ${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`,
        'appointments',
        appointment._id,
        {
          cancellation_reason,
        }
      );

      return appointment;
    } catch (error) {
      console.error('Error in cancelRequest:', error);
      throw error;
    }
  }

  /**
   * Get all appointments (accepted, completed, etc.)
   */
  async getMyAppointments(customerId, filters) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'pending',
        appointment_type,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build query for accepted appointments
      const query = {
        patient_id: customerId,
        appointment_request: 'accepted', // Only accepted appointments
      };

      if (status) {
        query.status = status;
      }

      if (appointment_type) {
        query.appointment_type = appointment_type;
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate(
            'doctor_id',
            'first_name last_name email consultation_fee specialization profile_picture'
          )
          .populate('slot_id', 'date start_time end_time')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Appointment.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        appointments,
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
      console.error('Error in getMyAppointments:', error);
      throw error;
    }
  }
}

export default new CustomerAppointmentsService();
