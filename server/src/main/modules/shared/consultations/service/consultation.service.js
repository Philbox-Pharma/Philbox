import Appointment from '../../../../models/Appointment.js';
import AppointmentMessage from '../../../../models/AppointmentMessage.js';
import PrescriptionGeneratedByDoctor from '../../../../models/PrescriptionGeneratedByDoctor.js';
import Review from '../../../../models/Review.js';
import axios from 'axios';

const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL ||
  process.env.SENTIMENT_ANALYSIS_API_URL ||
  'https://sentiment-api.vercel.app/predict';

class ConsultationService {
  async _predictSentiment(reviewText) {
    try {
      const response = await axios.post(
        SENTIMENT_API_URL,
        { review: String(reviewText || '') },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      );

      const predictedSentiment = String(
        response.data?.sentiment ||
          response.data?.label ||
          response.data?.prediction ||
          response.data?.result ||
          'neutral'
      )
        .toLowerCase()
        .trim();

      if (['positive', 'negative', 'neutral'].includes(predictedSentiment)) {
        return predictedSentiment;
      }

      return 'neutral';
    } catch (error) {
      console.error(
        'Consultation review sentiment prediction failed:',
        error.message
      );
      return 'neutral';
    }
  }

  _roomName(appointmentId) {
    return `consultation:${appointmentId}`;
  }

  _isDoctor(userRole) {
    return String(userRole || '').toLowerCase() === 'doctor';
  }

  _isCustomer(userRole) {
    return (
      String(userRole || '').toLowerCase() === 'customer' ||
      String(userRole || '').toLowerCase() === 'patient'
    );
  }

  _normalizeId(value) {
    return String(value || '').trim();
  }

  _parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  _formatDateKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  _parseTimeToMinutes(timeValue) {
    const [hoursPart = '0', minutesPart = '0'] = String(timeValue || '')
      .trim()
      .split(':');
    const hours = Number.parseInt(hoursPart, 10);
    const minutes = Number.parseInt(minutesPart, 10);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  }

  _buildSlotWindowError(message) {
    const error = new Error(message);
    error.code = 'CONSULTATION_OUTSIDE_SLOT_WINDOW';
    return error;
  }

  _ensureConsultationWithinSlotWindow(appointment, now = new Date()) {
    const slot = appointment?.slot_id;

    if (!slot?.date || !slot?.start_time || !slot?.end_time) {
      throw this._buildSlotWindowError(
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }

    const slotDate = new Date(slot.date);
    if (Number.isNaN(slotDate.getTime())) {
      throw this._buildSlotWindowError(
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }

    if (this._formatDateKey(slotDate) !== this._formatDateKey(now)) {
      throw this._buildSlotWindowError(
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }

    const startMinutes = this._parseTimeToMinutes(slot.start_time);
    const endMinutes = this._parseTimeToMinutes(slot.end_time);

    if (
      !Number.isFinite(startMinutes) ||
      !Number.isFinite(endMinutes) ||
      endMinutes <= startMinutes
    ) {
      throw this._buildSlotWindowError(
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }

    const slotStart = new Date(slotDate);
    slotStart.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

    const slotEnd = new Date(slotDate);
    slotEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    if (now < slotStart || now > slotEnd) {
      throw this._buildSlotWindowError(
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }
  }

  _appointmentMode(appointment) {
    return appointment?.appointment_type === 'online' ? 'video' : 'chat';
  }

  _isParticipant(appointment, userRole, userId) {
    const normalizedUserId = this._normalizeId(userId);
    if (!normalizedUserId) return false;

    if (this._isDoctor(userRole)) {
      return (
        this._normalizeId(
          appointment?.doctor_id?._id || appointment?.doctor_id
        ) === normalizedUserId
      );
    }

    if (this._isCustomer(userRole)) {
      return (
        this._normalizeId(
          appointment?.patient_id?._id || appointment?.patient_id
        ) === normalizedUserId
      );
    }

    return false;
  }

  async _loadAppointment(appointmentId) {
    return Appointment.findById(appointmentId)
      .populate(
        'doctor_id',
        'fullName firstName first_name lastName last_name email specialization consultation_type consultation_fee profile_img_url'
      )
      .populate(
        'patient_id',
        'fullName firstName first_name lastName last_name email contactNumber profile_img_url'
      )
      .populate('slot_id', 'date start_time end_time slot_duration')
      .populate(
        'prescription_generated',
        'diagnosis_reason file_url digital_verification_id special_instructions valid_till created_at'
      )
      .lean();
  }

  _buildPrescriptionSummary(prescription) {
    if (!prescription) return null;

    return {
      _id: prescription._id,
      diagnosis_reason: prescription.diagnosis_reason || '',
      special_instructions: prescription.special_instructions || '',
      digital_verification_id: prescription.digital_verification_id || null,
      file_url: prescription.file_url || null,
      valid_till: prescription.valid_till || null,
      created_at: prescription.created_at || null,
      can_download: Boolean(prescription.file_url),
    };
  }

  _buildAppointmentPayload(appointment) {
    if (!appointment) return null;

    const roomName =
      appointment.consultation_room_id || this._roomName(appointment._id);
    const consultationMode =
      appointment.consultation_mode || this._appointmentMode(appointment);
    const prescription = this._buildPrescriptionSummary(
      appointment.prescription_generated
    );

    return {
      _id: appointment._id,
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      slot_id: appointment.slot_id,
      appointment_type: appointment.appointment_type,
      status: appointment.status,
      appointment_request: appointment.appointment_request,
      consultation_reason: appointment.consultation_reason || null,
      preferred_date: appointment.preferred_date || null,
      preferred_time: appointment.preferred_time || null,
      notes: appointment.notes || null,
      recording_url: appointment.recording_url || null,
      consultation_room_id: roomName,
      consultation_mode: consultationMode,
      consultation_started_at: appointment.consultation_started_at || null,
      consultation_ended_at: appointment.consultation_ended_at || null,
      consultation_duration_seconds:
        appointment.consultation_duration_seconds || 0,
      consultation_started_by: appointment.consultation_started_by || null,
      can_video_call: consultationMode === 'video',
      chat_enabled: true,
      prescription,
    };
  }

  async getSessionContext({
    appointmentId,
    userRole,
    userId,
    allowCompleted = true,
  }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment || !this._isParticipant(appointment, userRole, userId)) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (appointment.appointment_request !== 'accepted') {
      throw new Error('CONSULTATION_NOT_READY');
    }

    if (!allowCompleted && appointment.status === 'completed') {
      throw new Error('CONSULTATION_ENDED');
    }

    const updates = {};
    if (!appointment.consultation_room_id) {
      updates.consultation_room_id = this._roomName(appointment._id);
    }
    if (!appointment.consultation_mode) {
      updates.consultation_mode = this._appointmentMode(appointment);
    }

    if (Object.keys(updates).length) {
      await Appointment.updateOne({ _id: appointment._id }, { $set: updates });
      Object.assign(appointment, updates);
    }

    return {
      session: this._buildAppointmentPayload(appointment),
      room_name:
        appointment.consultation_room_id || this._roomName(appointment._id),
      appointment: this._buildAppointmentPayload(appointment),
    };
  }

  async joinConsultation({ appointmentId, userRole, userId }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment || !this._isParticipant(appointment, userRole, userId)) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (appointment.appointment_request !== 'accepted') {
      throw new Error('CONSULTATION_NOT_READY');
    }

    const now = new Date();
    const updates = {
      consultation_room_id:
        appointment.consultation_room_id || this._roomName(appointment._id),
      consultation_mode:
        appointment.consultation_mode || this._appointmentMode(appointment),
      consultation_last_activity_at: now,
      status: appointment.status === 'completed' ? 'completed' : 'in-progress',
    };

    if (!appointment.consultation_started_at) {
      updates.consultation_started_at = now;
    }

    if (!appointment.consultation_started_by) {
      updates.consultation_started_by = this._isDoctor(userRole)
        ? 'doctor'
        : 'patient';
    }

    await Appointment.updateOne({ _id: appointment._id }, { $set: updates });

    return {
      room_name: updates.consultation_room_id,
      participant_role: this._isDoctor(userRole) ? 'doctor' : 'patient',
      can_video_call: updates.consultation_mode === 'video',
      chat_enabled: true,
      status: updates.status,
      consultation_started_at:
        updates.consultation_started_at ||
        appointment.consultation_started_at ||
        now,
    };
  }

  async startConsultation({ appointmentId, doctorId }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (
      this._normalizeId(appointment.doctor_id?._id || appointment.doctor_id) !==
      this._normalizeId(doctorId)
    ) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (appointment.appointment_request !== 'accepted') {
      throw new Error('CONSULTATION_NOT_READY');
    }

    const now = new Date();
    this._ensureConsultationWithinSlotWindow(appointment, now);

    const updates = {
      consultation_room_id:
        appointment.consultation_room_id || this._roomName(appointment._id),
      consultation_mode:
        appointment.consultation_mode || this._appointmentMode(appointment),
      consultation_started_at: appointment.consultation_started_at || now,
      consultation_started_by: appointment.consultation_started_by || 'doctor',
      consultation_last_activity_at: now,
      status: 'in-progress',
    };

    await Appointment.updateOne({ _id: appointment._id }, { $set: updates });

    return {
      room_name: updates.consultation_room_id,
      status: updates.status,
      can_video_call: updates.consultation_mode === 'video',
      chat_enabled: true,
      consultation_started_at: updates.consultation_started_at,
    };
  }

  async endConsultation({
    appointmentId,
    doctorId,
    recordingUrl = null,
    notes = null,
  }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (
      this._normalizeId(appointment.doctor_id?._id || appointment.doctor_id) !==
      this._normalizeId(doctorId)
    ) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    const now = new Date();
    const startedAt = appointment.consultation_started_at
      ? new Date(appointment.consultation_started_at)
      : now;
    const safeStartedAt = Number.isNaN(startedAt.getTime()) ? now : startedAt;
    const durationSeconds = Math.max(
      0,
      Math.round((now.getTime() - safeStartedAt.getTime()) / 1000)
    );

    const updates = {
      consultation_room_id:
        appointment.consultation_room_id || this._roomName(appointment._id),
      consultation_ended_at: now,
      consultation_duration_seconds: durationSeconds,
      status: 'completed',
      consultation_last_activity_at: now,
    };

    if (recordingUrl) {
      updates.recording_url = recordingUrl;
    }

    if (notes) {
      updates.notes = notes;
    }

    await Appointment.updateOne({ _id: appointment._id }, { $set: updates });

    return {
      room_name: updates.consultation_room_id,
      status: updates.status,
      consultation_ended_at: now,
      consultation_duration_seconds: durationSeconds,
      recording_url: updates.recording_url || appointment.recording_url || null,
    };
  }

  async updateRecordingUrl({ appointmentId, doctorId, recordingUrl }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (
      this._normalizeId(appointment.doctor_id?._id || appointment.doctor_id) !==
      this._normalizeId(doctorId)
    ) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    await Appointment.updateOne(
      { _id: appointment._id },
      {
        $set: {
          recording_url: recordingUrl,
          consultation_last_activity_at: new Date(),
        },
      }
    );

    return {
      recording_url: recordingUrl,
    };
  }

  async listMessages({
    appointmentId,
    userRole,
    userId,
    page = 1,
    limit = 50,
  }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment || !this._isParticipant(appointment, userRole, userId)) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    const safePage = this._parsePositiveInt(page, 1);
    const safeLimit = this._parsePositiveInt(limit, 50);
    const query = { appointment_id: appointment._id };

    const [messages, total] = await Promise.all([
      AppointmentMessage.find(query)
        .sort({ created_at: 1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      AppointmentMessage.countDocuments(query),
    ]);

    return {
      room_name:
        appointment.consultation_room_id || this._roomName(appointment._id),
      messages: messages.map(message => ({
        _id: message._id,
        appointment_id: message.appointment_id,
        text: message.text,
        from: message.from,
        to: message.to,
        media_url: message.media_url || null,
        created_at: message.created_at,
      })),
      pagination: {
        current_page: safePage,
        total_pages: Math.ceil(total / safeLimit),
        total_items: total,
        items_per_page: safeLimit,
        has_next: safePage * safeLimit < total,
        has_prev: safePage > 1,
      },
    };
  }

  async sendMessage({
    appointmentId,
    userRole,
    userId,
    text,
    mediaUrl = null,
  }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment || !this._isParticipant(appointment, userRole, userId)) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (!String(text || '').trim() && !mediaUrl) {
      throw new Error('MESSAGE_CONTENT_REQUIRED');
    }

    const senderRole = this._isDoctor(userRole) ? 'doctor' : 'patient';
    const receiverRole = senderRole === 'doctor' ? 'patient' : 'doctor';
    const message = await AppointmentMessage.create({
      appointment_id: appointment._id,
      text: String(text || '').trim() || '',
      from: senderRole,
      to: receiverRole,
      media_url: mediaUrl || undefined,
    });

    const payload = {
      _id: message._id,
      appointment_id: message.appointment_id,
      text: message.text,
      from: message.from,
      to: message.to,
      media_url: message.media_url || null,
      created_at: message.created_at,
    };

    await Appointment.updateOne(
      { _id: appointment._id },
      { $set: { consultation_last_activity_at: new Date() } }
    );

    return {
      room_name:
        appointment.consultation_room_id || this._roomName(appointment._id),
      message: payload,
    };
  }

  async createConsultationReview({
    appointmentId,
    customerId,
    rating,
    message,
  }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (
      !appointment ||
      this._normalizeId(
        appointment.patient_id?._id || appointment.patient_id
      ) !== this._normalizeId(customerId)
    ) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (appointment.status !== 'completed') {
      throw new Error('CONSULTATION_NOT_COMPLETED');
    }

    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error('INVALID_RATING');
    }

    if (!String(message || '').trim()) {
      throw new Error('REVIEW_MESSAGE_REQUIRED');
    }

    const normalizedMessage = String(message || '').trim();
    if (normalizedMessage.length < 10 || normalizedMessage.length > 500) {
      throw new Error('INVALID_REVIEW_MESSAGE_LENGTH');
    }

    const doctorId = appointment.doctor_id?._id || appointment.doctor_id;
    const existingReview = await Review.findOne({
      customer_id: customerId,
      appointment_id: appointment._id,
    }).lean();

    if (existingReview) {
      throw new Error('REVIEW_ALREADY_EXISTS');
    }

    const sentiment = await this._predictSentiment(normalizedMessage);

    const review = await Review.create({
      customer_id: customerId,
      target_type: 'doctor',
      target_id: doctorId,
      appointment_id: appointment._id,
      rating: normalizedRating,
      message: normalizedMessage,
      sentiment,
    });

    return {
      review,
    };
  }

  async getPrescriptionForAppointment({ appointmentId, userRole, userId }) {
    const appointment = await this._loadAppointment(appointmentId);

    if (!appointment || !this._isParticipant(appointment, userRole, userId)) {
      throw new Error('CONSULTATION_NOT_FOUND');
    }

    if (!appointment.prescription_generated) {
      return {
        prescription: null,
      };
    }

    const prescription = await PrescriptionGeneratedByDoctor.findById(
      appointment.prescription_generated._id ||
        appointment.prescription_generated
    )
      .populate(
        'doctor_id',
        'fullName email specialization license_number profile_img_url'
      )
      .populate('patient_id', 'fullName email contactNumber profile_img_url')
      .populate(
        'appointment_id',
        'status appointment_type created_at consultation_reason'
      )
      .populate({
        path: 'prescription_items_ids',
        populate: {
          path: 'medicine_id',
          select:
            'Name alias_name sale_price prescription_required mgs dosage_form img_urls',
        },
      })
      .lean();

    if (!prescription) {
      return {
        prescription: null,
      };
    }

    return {
      prescription: {
        _id: prescription._id,
        diagnosis_reason: prescription.diagnosis_reason,
        special_instructions: prescription.special_instructions || '',
        file_url: prescription.file_url || null,
        valid_till: prescription.valid_till || null,
        created_at: prescription.created_at || null,
        doctor: prescription.doctor_id || null,
        patient: prescription.patient_id || null,
        appointment: prescription.appointment_id || null,
        medicines: (prescription.prescription_items_ids || []).map(item => ({
          _id: item._id,
          medicine_id: item.medicine_id?._id || item.medicine_id || null,
          medicine_name: item.medicine_id?.Name || 'Medicine',
          alias_name: item.medicine_id?.alias_name || null,
          dosage: item.dosage || null,
          form: item.form || null,
          frequency: item.frequency || null,
          duration_days: item.duration_days || 0,
          quantity_prescribed: item.quantity_prescribed || 0,
          instructions: item.instructions || '',
        })),
      },
    };
  }
}

export default new ConsultationService();
