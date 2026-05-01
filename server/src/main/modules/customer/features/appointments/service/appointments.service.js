import Appointment from '../../../../../models/Appointment.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import Stripe from 'stripe';
import DoctorSlot from '../../../../../models/DoctorSlot.js';
import Doctor from '../../../../../models/Doctor.js';
import Customer from '../../../../../models/Customer.js';
import Currency from '../../../../../models/Currency.js';
import Transaction from '../../../../../models/Transaction.js';
import customerConsultationService from '../../../../shared/consultations/service/customerConsultation.service.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import {
  sendAppointmentRequestSubmitted,
  sendNewAppointmentRequestNotification,
  sendAppointmentRequestSubmittedSMS,
} from '../../../../../utils/sendEmail.js';

const PAYMENT_METHOD_MAP = {
  jazzcash: 'JazzCash-Wallet',
  easypaisa: 'EasyPaisa-Wallet',
  stripe: 'Stripe-Card',
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const safeString = value => String(value ?? '').trim();
const toSmallestUnit = amount =>
  Math.max(1, Math.round(Number(amount || 0) * 100));

const buildRequestSignature = ({ secret, parts }) => {
  const payload = parts.map(part => safeString(part)).join('|');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

const gatewayResponseIsSuccess = responseData => {
  const statusText = safeString(
    responseData?.status ||
      responseData?.payment_status ||
      responseData?.statusCode ||
      responseData?.responseCode ||
      responseData?.pp_ResponseCode ||
      responseData?.result
  ).toLowerCase();

  return (
    statusText === 'success' ||
    statusText === 'succeeded' ||
    statusText === '00' ||
    statusText === '000' ||
    statusText === 'approved' ||
    statusText === 'completed'
  );
};

class CustomerAppointmentsService {
  async _processStripePayment({ amount, stripePaymentMethodId, reference }) {
    if (!stripeClient) {
      throw new Error('STRIPE_NOT_CONFIGURED');
    }

    if (!safeString(stripePaymentMethodId)) {
      throw new Error('STRIPE_PAYMENT_METHOD_REQUIRED');
    }

    const intent = await stripeClient.paymentIntents.create({
      amount: toSmallestUnit(amount),
      currency: 'pkr',
      payment_method: stripePaymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: `Philbox appointment booking ${reference}`,
      metadata: {
        booking_reference: reference,
      },
    });

    if (intent.status !== 'succeeded') {
      throw new Error('STRIPE_PAYMENT_NOT_COMPLETED');
    }

    return {
      provider: 'stripe',
      transactionId: intent.id,
      status: intent.status,
    };
  }

  async _processJazzCashPayment({
    amount,
    walletNumber,
    reference,
    customerId,
  }) {
    const apiUrl = process.env.JAZZCASH_API_URL;
    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const merchantPassword = process.env.JAZZCASH_MERCHANT_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!apiUrl || !merchantId || !merchantPassword || !integritySalt) {
      throw new Error('JAZZCASH_NOT_CONFIGURED');
    }

    if (!safeString(walletNumber)) {
      throw new Error('WALLET_NUMBER_REQUIRED');
    }

    const amountPaisa = toSmallestUnit(amount);
    const timestamp = Date.now().toString();
    const signature = buildRequestSignature({
      secret: integritySalt,
      parts: [
        merchantId,
        merchantPassword,
        reference,
        amountPaisa,
        walletNumber,
        timestamp,
      ],
    });

    const payload = {
      merchant_id: merchantId,
      merchant_password: merchantPassword,
      merchant_reference: reference,
      amount: amountPaisa,
      currency: 'PKR',
      wallet_number: walletNumber,
      customer_id: String(customerId),
      timestamp,
      signature,
    };

    const response = await axios.post(apiUrl, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!gatewayResponseIsSuccess(response.data)) {
      throw new Error('JAZZCASH_PAYMENT_FAILED');
    }

    return {
      provider: 'jazzcash',
      transactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.pp_TxnRefNo ||
        reference,
      status: 'successful',
    };
  }

  async _processEasyPaisaPayment({
    amount,
    walletNumber,
    reference,
    customerId,
  }) {
    const apiUrl = process.env.EASYPAISA_API_URL;
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;

    if (!apiUrl || !storeId || !hashKey) {
      throw new Error('EASYPAISA_NOT_CONFIGURED');
    }

    if (!safeString(walletNumber)) {
      throw new Error('WALLET_NUMBER_REQUIRED');
    }

    const amountPaisa = toSmallestUnit(amount);
    const timestamp = Date.now().toString();
    const signature = buildRequestSignature({
      secret: hashKey,
      parts: [storeId, reference, amountPaisa, walletNumber, timestamp],
    });

    const payload = {
      store_id: storeId,
      merchant_reference: reference,
      amount: amountPaisa,
      currency: 'PKR',
      wallet_number: walletNumber,
      customer_id: String(customerId),
      timestamp,
      signature,
    };

    const response = await axios.post(apiUrl, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!gatewayResponseIsSuccess(response.data)) {
      throw new Error('EASYPAISA_PAYMENT_FAILED');
    }

    return {
      provider: 'easypaisa',
      transactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.reference ||
        reference,
      status: 'successful',
    };
  }

  async _processPayment({
    customerId,
    paymentMethod,
    amount,
    walletNumber,
    stripePaymentMethodId,
    reference,
  }) {
    switch (paymentMethod) {
      case 'stripe':
        return this._processStripePayment({
          amount,
          stripePaymentMethodId,
          reference,
        });
      case 'jazzcash':
        return this._processJazzCashPayment({
          amount,
          walletNumber,
          reference,
          customerId,
        });
      case 'easypaisa':
        return this._processEasyPaisaPayment({
          amount,
          walletNumber,
          reference,
          customerId,
        });
      default:
        throw new Error('INVALID_PAYMENT_METHOD');
    }
  }

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
        payment_method,
        wallet_number,
        stripe_payment_method_id,
        upload_files = [],
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

      const paymentMethodValue = PAYMENT_METHOD_MAP[payment_method];
      if (!paymentMethodValue) {
        throw new Error('INVALID_PAYMENT_METHOD');
      }

      const consultationFee = Number(doctor.consultation_fee || 0);
      if (!Number.isFinite(consultationFee) || consultationFee <= 0) {
        throw new Error('INVALID_CONSULTATION_FEE');
      }

      const currency =
        (await Currency.findOne({ code: 'PKR' }).lean()) ||
        (await Currency.findOne({}).lean());

      if (!currency) {
        throw new Error('CURRENCY_NOT_CONFIGURED');
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

      const medicalDocumentUrls = [];
      for (const file of upload_files) {
        try {
          const fileUrl = await uploadToCloudinary(
            file.path,
            'customer/appointments/medical_documents'
          );
          if (fileUrl) {
            medicalDocumentUrls.push(fileUrl);
          }
        } catch {
          throw new Error('FILE_UPLOAD_FAILED');
        }
      }

      const paymentReference = `appointment_${customerId}_${Date.now()}`;
      const paymentResult = await this._processPayment({
        customerId,
        paymentMethod: payment_method,
        amount: consultationFee,
        walletNumber: wallet_number,
        stripePaymentMethodId: stripe_payment_method_id,
        reference: paymentReference,
      });

      const session = await mongoose.startSession();
      let appointment;

      try {
        session.startTransaction();

        const createdAppointments = await Appointment.create(
          [
            {
              doctor_id,
              patient_id: customerId,
              slot_id: slot_id || null,
              appointment_type,
              consultation_reason,
              preferred_date: preferred_date ? new Date(preferred_date) : null,
              preferred_time: preferred_time || null,
              appointment_request: 'processing',
              status: 'pending',
              medical_document_urls: medicalDocumentUrls,
            },
          ],
          { session }
        );

        appointment = createdAppointments[0];

        const createdTransactions = await Transaction.create(
          [
            {
              target_class: 'appointment',
              target_id: appointment._id,
              total_bill: consultationFee,
              transaction_type: 'pay',
              currency: currency._id,
              payment_status: 'successful',
              payment_method: paymentMethodValue,
              stripe_payment_intent_id:
                payment_method === 'stripe'
                  ? paymentResult.transactionId
                  : undefined,
              gateway_transaction_id:
                payment_method !== 'stripe'
                  ? paymentResult.transactionId
                  : undefined,
              wallet_number:
                payment_method !== 'stripe'
                  ? wallet_number || undefined
                  : undefined,
              device_details: req.headers['user-agent'] || 'appointment-api',
              country: req.headers['cf-ipcountry'] || req.body?.country || 'PK',
              ipAddress: req.ip || req.connection?.remoteAddress || undefined,
            },
          ],
          { session }
        );

        appointment.transaction_id = createdTransactions[0]._id;
        await appointment.save({ session });

        await session.commitTransaction();
      } catch (transactionError) {
        await session.abortTransaction();
        throw transactionError;
      } finally {
        session.endSession();
      }

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
          payment_method,
          paid_amount: consultationFee,
          has_medical_documents: medicalDocumentUrls.length > 0,
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

        // Send SMS notification to customer
        if (customer.phone_number) {
          await sendAppointmentRequestSubmittedSMS(
            customer.phone_number,
            customerName,
            doctorName,
            appointment_type
          );
        }
      } catch (emailError) {
        console.error(
          'Error sending appointment request submitted email/SMS:',
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

  async rescheduleRequest(customerId, appointmentId, payload, req) {
    try {
      const {
        slot_id,
        preferred_date,
        preferred_time,
        appointment_type,
        consultation_reason,
      } = payload;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient_id: customerId,
        appointment_request: 'processing',
      })
        .populate('doctor_id', 'first_name last_name email')
        .populate('patient_id', 'first_name last_name');

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_RESCHEDULABLE');
      }

      if (slot_id) {
        const slot = await DoctorSlot.findOne({
          _id: slot_id,
          doctor_id: appointment.doctor_id._id,
          status: 'available',
          date: { $gte: new Date() },
        });

        if (!slot) {
          throw new Error('SLOT_NOT_AVAILABLE');
        }

        appointment.slot_id = slot._id;

        if (!preferred_date) {
          appointment.preferred_date = slot.date;
        }

        if (!preferred_time) {
          appointment.preferred_time = slot.start_time;
        }
      }

      if (preferred_date) {
        appointment.preferred_date = new Date(preferred_date);
      }

      if (preferred_time) {
        appointment.preferred_time = preferred_time;
      }

      if (appointment_type) {
        appointment.appointment_type = appointment_type;
      }

      if (consultation_reason) {
        appointment.consultation_reason = consultation_reason;
      }

      await appointment.save();

      await logCustomerActivity(
        req,
        'appointment_request_reschedule',
        `Rescheduled appointment request with Dr. ${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`,
        'appointments',
        appointment._id,
        {
          slot_id: slot_id || null,
          preferred_date: appointment.preferred_date,
          preferred_time: appointment.preferred_time,
          appointment_type: appointment.appointment_type,
        }
      );

      const updatedAppointment = await Appointment.findById(appointment._id)
        .populate(
          'doctor_id',
          'first_name last_name email consultation_fee specialization profile_picture'
        )
        .populate('slot_id', 'date start_time end_time')
        .lean();

      return updatedAppointment;
    } catch (error) {
      console.error('Error in rescheduleRequest:', error);
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

  async getConsultationSession(customerId, appointmentId) {
    return customerConsultationService.getConsultationSession(
      customerId,
      appointmentId
    );
  }

  async joinConsultation(customerId, appointmentId) {
    return customerConsultationService.joinConsultation(
      customerId,
      appointmentId
    );
  }

  async listConsultationMessages(customerId, appointmentId, filters = {}) {
    return customerConsultationService.listConsultationMessages(
      customerId,
      appointmentId,
      filters
    );
  }

  async sendConsultationMessage(customerId, appointmentId, payload = {}) {
    return customerConsultationService.sendConsultationMessage(
      customerId,
      appointmentId,
      payload
    );
  }

  async getPrescriptionForAppointment(customerId, appointmentId) {
    return customerConsultationService.getPrescriptionForAppointment(
      customerId,
      appointmentId
    );
  }

  async createConsultationReview(customerId, appointmentId, payload = {}) {
    return customerConsultationService.createConsultationReview(
      customerId,
      appointmentId,
      payload
    );
  }
}

export default new CustomerAppointmentsService();
