import consultationCoreService from './consultation.service.js';

class DoctorConsultationService {
  async getConsultationSession(doctorId, consultationId) {
    return consultationCoreService.getSessionContext({
      appointmentId: consultationId,
      userRole: 'doctor',
      userId: doctorId,
      allowCompleted: true,
    });
  }

  async startConsultation(doctorId, consultationId) {
    return consultationCoreService.startConsultation({
      appointmentId: consultationId,
      doctorId,
    });
  }

  async endConsultation(doctorId, consultationId, payload = {}) {
    return consultationCoreService.endConsultation({
      appointmentId: consultationId,
      doctorId,
      recordingUrl: payload.recording_url || payload.recordingUrl || null,
      notes: payload.notes || null,
    });
  }

  async updateRecordingUrl(doctorId, consultationId, recordingUrl) {
    return consultationCoreService.updateRecordingUrl({
      appointmentId: consultationId,
      doctorId,
      recordingUrl,
    });
  }

  async listConsultationMessages(doctorId, consultationId, filters = {}) {
    return consultationCoreService.listMessages({
      appointmentId: consultationId,
      userRole: 'doctor',
      userId: doctorId,
      page: filters.page,
      limit: filters.limit,
    });
  }

  async sendConsultationMessage(doctorId, consultationId, payload = {}) {
    return consultationCoreService.sendMessage({
      appointmentId: consultationId,
      userRole: 'doctor',
      userId: doctorId,
      text: payload.text,
      mediaUrl: payload.media_url || payload.mediaUrl || null,
    });
  }
}

export default new DoctorConsultationService();
