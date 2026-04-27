import Appointment from '../../../../../models/Appointment.js';
import DoctorSlot from '../../../../../models/DoctorSlot.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import {
  sendAppointmentRequestAccepted,
  sendAppointmentRequestRejected,
} from '../../../../../utils/sendEmail.js';

class DoctorAppointmentsService {
  /**
   * Get pending appointment requests for a doctor with pagination and filters
   */
  async getPendingRequests(doctorId, filters) {
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
        doctor_id: doctorId,
        appointment_request: status,
      };

      if (appointment_type) {
        query.appointment_type = appointment_type;
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patient_id', 'first_name last_name email phone_number')
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
      console.error('Error in getPendingRequests:', error);
      throw error;
    }
  }

  /**
   * Get appointment request details
   */
  async getRequestDetails(doctorId, appointmentId) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
      })
        .populate('patient_id', 'first_name last_name email phone_number')
        .populate('slot_id', 'date start_time end_time slot_duration')
        .lean();

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      return appointment;
    } catch (error) {
      console.error('Error in getRequestDetails:', error);
      throw error;
    }
  }

  /**
   * Accept an appointment request
   */
  async acceptRequest(doctorId, appointmentId, acceptData, req) {
    try {
      const { slot_id, notes } = acceptData;

      // Find the appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
        appointment_request: 'processing',
      })
        .populate('patient_id', 'first_name last_name email')
        .populate('doctor_id', 'first_name last_name consultation_fee');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND_OR_ALREADY_PROCESSED');
      }

      // If a slot_id is provided, verify it belongs to the doctor and is available
      if (slot_id) {
        const slot = await DoctorSlot.findOne({
          _id: slot_id,
          doctor_id: doctorId,
          status: 'available',
        });

        if (!slot) {
          throw new Error('SLOT_NOT_AVAILABLE');
        }

        // Update slot status to booked
        slot.status = 'booked';
        await slot.save();

        // Update appointment with slot
        appointment.slot_id = slot_id;
      }

      // Update appointment status
      appointment.appointment_request = 'accepted';
      if (notes) {
        appointment.notes = notes;
      }

      await appointment.save();

      // Log activity
      await logDoctorActivity(
        req,
        'appointment_accept',
        `Accepted appointment request from ${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`,
        'appointments',
        appointment._id,
        {
          slot_id,
          notes,
        }
      );

      // Send email notification to patient
      try {
        const doctorName = `${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`;
        const patientName = `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`;

        let appointmentDate = 'To be scheduled';
        if (appointment.slot_id) {
          const slot = await DoctorSlot.findById(appointment.slot_id);
          if (slot) {
            const date = new Date(slot.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            appointmentDate = `${date} at ${slot.start_time}`;
          }
        }

        const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/appointments`;

        await sendAppointmentRequestAccepted(
          appointment.patient_id.email,
          patientName,
          doctorName,
          appointment.appointment_type,
          appointmentDate,
          appointment.doctor_id.consultation_fee || 0,
          notes || '',
          dashboardLink
        );
      } catch (emailError) {
        console.error('Error sending appointment accepted email:', emailError);
        // Don't throw - appointment is still accepted even if email fails
      }

      return appointment;
    } catch (error) {
      console.error('Error in acceptRequest:', error);
      throw error;
    }
  }

  /**
   * Reject an appointment request with reason
   */
  async rejectRequest(doctorId, appointmentId, rejectData, req) {
    try {
      const { rejection_reason } = rejectData;

      // Find the appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
        appointment_request: 'processing',
      })
        .populate('patient_id', 'first_name last_name email')
        .populate('doctor_id', 'first_name last_name');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND_OR_ALREADY_PROCESSED');
      }

      // Update appointment status
      appointment.appointment_request = 'cancelled';
      appointment.rejection_reason = rejection_reason;

      await appointment.save();

      // Log activity
      await logDoctorActivity(
        req,
        'appointment_reject',
        `Rejected appointment request from ${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`,
        'appointments',
        appointment._id,
        {
          rejection_reason,
        }
      );

      // Send email notification to patient
      try {
        const doctorName = `${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`;
        const patientName = `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`;

        let requestedDate = 'Not specified';
        if (appointment.preferred_date) {
          requestedDate = new Date(
            appointment.preferred_date
          ).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          if (appointment.preferred_time) {
            requestedDate += ` at ${appointment.preferred_time}`;
          }
        }

        const findDoctorsLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/find-doctors`;

        await sendAppointmentRequestRejected(
          appointment.patient_id.email,
          patientName,
          doctorName,
          requestedDate,
          appointment.appointment_type,
          rejection_reason,
          findDoctorsLink
        );
      } catch (emailError) {
        console.error('Error sending appointment rejected email:', emailError);
        // Don't throw - appointment is still rejected even if email fails
      }

      return appointment;
    } catch (error) {
      console.error('Error in rejectRequest:', error);
      throw error;
    }
  }

  /**
   * Get all appointments for a doctor (accepted appointments)
   */
  async getAcceptedAppointments(doctorId, filters) {
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
        doctor_id: doctorId,
        appointment_request: 'accepted',
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
          .populate('patient_id', 'first_name last_name email phone_number')
          .populate('slot_id', 'date start_time end_time slot_duration')
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
      console.error('Error in getAcceptedAppointments:', error);
      throw error;
    }
  }
  /**
   * Start an online consultation - generates a Jitsi meeting link
   */
  async startConsultation(doctorId, appointmentId, req) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
        appointment_request: 'accepted',
        status: 'pending',
      }).populate('patient_id', 'fullName email');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND_OR_NOT_READY');
      }

      // Generate Jitsi meeting room name
      const roomName = `philbox-${appointmentId}-${Date.now()}`;
      const meetingLink = `https://meet.jit.si/${roomName}`;

      appointment.status = 'in-progress';
      appointment.meeting_link = meetingLink;
      await appointment.save();

      // Log activity
      await logDoctorActivity(
        req,
        'consultation_start',
        `Started online consultation with ${appointment.patient_id?.fullName || 'patient'}`,
        'appointments',
        appointment._id,
        { meeting_link: meetingLink }
      );

      return {
        appointment,
        meeting_link: meetingLink,
        room_name: roomName,
      };
    } catch (error) {
      console.error('Error in startConsultation:', error);
      throw error;
    }
  }

  /**
   * Complete a consultation - marks it as completed with notes
   */
  async completeConsultation(doctorId, appointmentId, data, req) {
    try {
      const { notes, recording_url } = data;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
        appointment_request: 'accepted',
        status: { $in: ['pending', 'in-progress'] },
      }).populate('patient_id', 'fullName email');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND_OR_ALREADY_COMPLETED');
      }

      appointment.status = 'completed';
      if (notes) appointment.notes = notes;
      if (recording_url) appointment.recording_url = recording_url;
      await appointment.save();

      // Log activity
      await logDoctorActivity(
        req,
        'consultation_complete',
        `Completed consultation with ${appointment.patient_id?.fullName || 'patient'}`,
        'appointments',
        appointment._id,
        { notes }
      );

      return appointment;
    } catch (error) {
      console.error('Error in completeConsultation:', error);
      throw error;
    }
  }

  /**
   * Mark appointment as missed
   */
  async markAsMissed(doctorId, appointmentId, data, req) {
    try {
      const { missed_by = 'patient' } = data;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
        appointment_request: 'accepted',
        status: 'pending',
      }).populate('patient_id', 'fullName email');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      appointment.status = 'missed';
      appointment.missed_by = missed_by;
      await appointment.save();

      // Log activity
      await logDoctorActivity(
        req,
        'appointment_missed',
        `Marked appointment with ${appointment.patient_id?.fullName || 'patient'} as missed by ${missed_by}`,
        'appointments',
        appointment._id
      );

      return appointment;
    } catch (error) {
      console.error('Error in markAsMissed:', error);
      throw error;
    }
  }

  /**
   * Get meeting info for an appointment
   */
  async getMeetingInfo(doctorId, appointmentId) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor_id: doctorId,
      })
        .select('meeting_link status appointment_type')
        .populate('patient_id', 'fullName email profile_img_url')
        .lean();

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      return appointment;
    } catch (error) {
      console.error('Error in getMeetingInfo:', error);
      throw error;
    }
  }
}

export default new DoctorAppointmentsService();
