import apiClient from '../client';

const appointmentsService = {
  // === Appointment Requests ===

  // Create a new appointment request
  // Body: doctor_id, slot_id (optional), appointment_type, consultation_reason, preferred_date, preferred_time
  createRequest: (data) => {
    return apiClient.post('/customer/appointments/requests', data);
  },

  // Get all appointment requests for the logged-in customer
  // Params: page, limit, status, appointment_type, sort_by, sort_order
  getRequests: (params = {}) => {
    return apiClient.get('/customer/appointments/requests', { params });
  },

  // Get a single appointment request status/details
  getRequestById: (appointmentId) => {
    return apiClient.get(`/customer/appointments/requests/${appointmentId}`);
  },

  // Cancel an appointment request
  cancelRequest: (appointmentId, cancellation_reason = '') => {
    return apiClient.post(`/customer/appointments/requests/${appointmentId}/cancel`, {
      cancellation_reason,
    });
  },

  // === Accepted / Confirmed Appointments ===

  // Get accepted/confirmed appointments
  // Params: page, limit, status, appointment_type, sort_by, sort_order
  getAppointments: (params = {}) => {
    return apiClient.get('/customer/appointments', { params });
  },

  // === Video Consultation ===
  
  // Get meeting info for a specific appointment
  getMeetingInfo: (appointmentId) => {
    return apiClient.get(`/customer/appointments/${appointmentId}/meeting`);
  },
};

export default appointmentsService;
