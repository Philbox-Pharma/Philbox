import consultationCoreService from './consultation.service.js';

class CustomerConsultationService {
  async getConsultationSession(customerId, appointmentId) {
    return consultationCoreService.getSessionContext({
      appointmentId,
      userRole: 'customer',
      userId: customerId,
      allowCompleted: true,
    });
  }

  async joinConsultation(customerId, appointmentId) {
    return consultationCoreService.joinConsultation({
      appointmentId,
      userRole: 'customer',
      userId: customerId,
    });
  }

  async listConsultationMessages(customerId, appointmentId, filters = {}) {
    return consultationCoreService.listMessages({
      appointmentId,
      userRole: 'customer',
      userId: customerId,
      page: filters.page,
      limit: filters.limit,
    });
  }

  async sendConsultationMessage(customerId, appointmentId, payload = {}) {
    return consultationCoreService.sendMessage({
      appointmentId,
      userRole: 'customer',
      userId: customerId,
      text: payload.text,
      mediaUrl: payload.media_url || payload.mediaUrl || null,
    });
  }

  async getPrescriptionForAppointment(customerId, appointmentId) {
    return consultationCoreService.getPrescriptionForAppointment({
      appointmentId,
      userRole: 'customer',
      userId: customerId,
    });
  }

  async createConsultationReview(customerId, appointmentId, payload = {}) {
    return consultationCoreService.createConsultationReview({
      appointmentId,
      customerId,
      rating: payload.rating,
      message: payload.message,
    });
  }
}

export default new CustomerConsultationService();
