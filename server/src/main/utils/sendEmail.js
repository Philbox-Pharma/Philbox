import { brevo, fromEmail } from '../config/brevo.config.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  OTP_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  DOCTOR_APPLICATION_APPROVED_TEMPLATE,
  DOCTOR_APPLICATION_REJECTED_TEMPLATE,
  DOCTOR_STATUS_UPDATE_TEMPLATE,
  REFILL_REMINDER_TEMPLATE,
  APPOINTMENT_REQUEST_SUBMITTED_TEMPLATE,
  APPOINTMENT_REQUEST_ACCEPTED_TEMPLATE,
  APPOINTMENT_REQUEST_REJECTED_TEMPLATE,
  NEW_APPOINTMENT_REQUEST_NOTIFICATION_TEMPLATE,
} from '../constants/global.mail.constants.js';

/**
 * Helper to format name (e.g., "john doe" -> "John Doe")
 */
const formatName = name => {
  if (!name) return 'User';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Helper to format greeting based on role
 * Returns "Dr. John Doe" if role is Doctor, otherwise "John Doe"
 */
const getGreetingName = (name, role) => {
  const cleanName = formatName(name);
  return role === 'Doctor' ? `Dr. ${cleanName}` : cleanName;
};

/**
 * Send Verification Email (Reusable for Doctor & Customer)
 * @param {string} email - Recipient email
 * @param {string} verificationLink - Verification link with token
 * @param {string} name - User's full name
 * @param {string} role - 'Doctor' | 'Customer' | 'Salesperson'
 */
export const sendVerificationEmail = async (
  email,
  verificationLink,
  name,
  role = 'User'
) => {
  const greetingName = getGreetingName(name, role);

  // Replace placeholders in the generic template
  const message = VERIFICATION_EMAIL_TEMPLATE.replace('{{NAME}}', greetingName)
    .replace('{{LINK}}', verificationLink)
    .replace('{{ROLE}}', role);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      subject: `Philbox - Verify Your ${role} Account`,
      html: message,
    });

    if (error) {
      console.error(`Error sending ${role} verification email:`, error);
      throw error;
    }

    console.log(`${role} verification email sent:`, data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`Error sending ${role} verification email:`, error);
    throw error;
  }
};

/**
 * Send Password Reset Email (Reusable for Doctor & Customer)
 * @param {string} email - Recipient email
 * @param {string} resetLink - Reset link with token
 * @param {string} name - User's full name
 * @param {string} role - 'Doctor' | 'Customer' | 'User'
 */
export const sendResetEmail = async (email, resetLink, name, role = 'User') => {
  const greetingName = getGreetingName(name, role);

  // Replace placeholders in the generic template
  const message = PASSWORD_RESET_TEMPLATE.replace('{{NAME}}', greetingName)
    .replace('{{LINK}}', resetLink)
    .replace('{{ROLE}}', role);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      subject: `Philbox - Reset ${role} Password`,
      html: message,
    });

    if (error) {
      console.error(`Error sending ${role} reset email:`, error);
      throw error;
    }

    console.log(`${role} password reset email sent:`, data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`Error sending ${role} reset email:`, error);
    throw error;
  }
};

/**
 * Send OTP Email (2FA)
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password code
 * @param {string} name - User's full name
 * @param {string} role - 'Admin' | 'Salesperson' | 'Doctor' | 'Customer'
 */
export const sendOTP = async (email, otp, name = 'User', role = 'User') => {
  const greetingName = getGreetingName(name, role);

  const message = OTP_TEMPLATE.replace('{{OTP}}', otp)
    .replace('{{NAME}}', greetingName)
    .replace('{{ROLE}}', role);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      subject: `Philbox - ${role} Login Verification`,
      html: message,
    });

    if (error) {
      console.error(`Error sending ${role} OTP email:`, error);
      throw error;
    }

    console.log(`${role} OTP email sent:`, data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`Error sending ${role} OTP email:`, error);
    throw error;
  }
};

/**
 * ✅ NEW: Send Welcome Email with Credentials
 * Reusable for Salesperson, Branch Admin, etc.
 * @param {string} email - User email
 * @param {string} name - User full name
 * @param {string} password - The password set by admin (sent to user)
 * @param {string} role - e.g. 'Salesperson'
 * @param {string} loginLink - URL to login page
 */
export const sendWelcomeEmail = async (
  email,
  name,
  password,
  role,
  loginLink
) => {
  const greetingName = getGreetingName(name, role);

  const message = WELCOME_EMAIL_TEMPLATE.replace('{{NAME}}', greetingName)
    .replace('{{ROLE}}', role)
    .replace('{{EMAIL}}', email)
    .replace('{{PASSWORD}}', password)
    .replace('{{LINK}}', loginLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: `Welcome to Philbox - Your ${role} Account`,
      html: message,
    });

    if (error) {
      console.error(`Error sending ${role} welcome email:`, error);
      throw error;
    }

    console.log(`${role} welcome email sent:`, data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`Error sending ${role} welcome email:`, error);
    throw error;
  }
};

/**
 * Send Doctor Application Approved Email
 * @param {string} email - Doctor's email
 * @param {string} name - Doctor's full name
 * @param {string} comment - Admin's approval comment/notes
 * @param {string} loginLink - Link to doctor login page
 */
export const sendApplicationApprovedEmail = async (
  email,
  name,
  comment,
  loginLink
) => {
  const greetingName = getGreetingName(name, 'Doctor');

  const message = DOCTOR_APPLICATION_APPROVED_TEMPLATE.replace(
    '{{NAME}}',
    greetingName
  )
    .replace('{{COMMENT}}', comment || 'Your credentials have been verified.')
    .replace('{{LINK}}', loginLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: 'Philbox - Your Doctor Application Has Been Approved',
      html: message,
    });

    if (error) {
      console.error('Error sending application approved email:', error);
      throw error;
    }

    console.log('Application approved email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending application approved email:', error);
    throw error;
  }
};

/**
 * Send Doctor Application Rejected Email
 * @param {string} email - Doctor's email
 * @param {string} name - Doctor's full name
 * @param {string} reason - Reason for rejection
 * @param {string} supportLink - Link to contact support
 */
export const sendApplicationRejectedEmail = async (
  email,
  name,
  reason,
  supportLink
) => {
  const greetingName = getGreetingName(name, 'Doctor');

  const message = DOCTOR_APPLICATION_REJECTED_TEMPLATE.replace(
    '{{NAME}}',
    greetingName
  )
    .replace(
      '{{COMMENT}}',
      reason || 'Please review the submitted documents and try again.'
    )
    .replace('{{LINK}}', supportLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: 'Philbox - Application Status Update',
      html: message,
    });

    if (error) {
      console.error('Error sending application rejected email:', error);
      throw error;
    }

    console.log('Application rejected email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending application rejected email:', error);
    throw error;
  }
};

/**
 * Send Doctor Status Update Email (for suspension/activation)
 * @param {string} email - Doctor's email
 * @param {string} name - Doctor's full name
 * @param {string} status - New account status
 * @param {string} message - Status update message
 */
export const sendDoctorStatusUpdateEmail = async (
  email,
  name,
  status,
  message
) => {
  const greetingName = getGreetingName(name, 'Doctor');
  const subject =
    status === 'active'
      ? 'Philbox - Your Account Has Been Activated'
      : 'Philbox - Account Status Update';

  const loginButton =
    status === 'active'
      ? `<a href="${process.env.FRONTEND_URL}/doctor/auth/login" class="btn">Login to Your Account</a>`
      : '';

  const emailTemplate = DOCTOR_STATUS_UPDATE_TEMPLATE.replace(
    '{{NAME}}',
    greetingName
  )
    .replace('{{MESSAGE}}', message)
    .replace('{{LOGIN_BUTTON}}', loginButton);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: subject,
      html: emailTemplate,
    });

    if (error) {
      console.error('Error sending status update email:', error);
      throw error;
    }

    console.log('Status update email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
};

/**
 * Generic Email Sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: to,
      replyTo: 'philboxpk@gmail.com',
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send Medicine Refill Reminder Email
 * @param {string} email - Customer's email
 * @param {string} name - Customer's full name
 * @param {Array} medicines - Array of medicine objects with tradeName, genericName, strength
 */
export const sendRefillReminderEmail = async (email, name, medicines) => {
  const greetingName = formatName(name);

  const medicineList = medicines
    .map(
      med =>
        `<li style="padding: 8px 0;"><strong>${med.tradeName || med.genericName}</strong> ${med.strength ? `- ${med.strength}` : ''}</li>`
    )
    .join('');

  const medicineLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/medicines`;

  const emailTemplate = REFILL_REMINDER_TEMPLATE.replace(
    '{{NAME}}',
    greetingName
  )
    .replace('{{MEDICINE_LIST}}', medicineList)
    .replace('{{LINK}}', medicineLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: '💊 Medicine Refill Reminder - Philbox',
      html: emailTemplate,
    });

    if (error) {
      console.error('Error sending refill reminder email:', error);
      throw error;
    }

    console.log('Refill reminder email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending refill reminder email:', error);
    throw error;
  }
};

/**
 * Send Appointment Request Submitted Confirmation to Patient
 * @param {string} email - Patient email
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentType - Type of appointment (in-person/online)
 * @param {string} preferredDate - Preferred date and time
 * @param {number} consultationFee - Consultation fee amount
 */
export const sendAppointmentRequestSubmitted = async (
  email,
  patientName,
  doctorName,
  appointmentType,
  preferredDate,
  consultationFee
) => {
  const greetingName = formatName(patientName);
  const formattedDoctorName = formatName(doctorName);

  const emailTemplate = APPOINTMENT_REQUEST_SUBMITTED_TEMPLATE.replace(
    '{{PATIENT_NAME}}',
    greetingName
  )
    .replace(/{{DOCTOR_NAME}}/g, formattedDoctorName)
    .replace('{{APPOINTMENT_TYPE}}', appointmentType)
    .replace('{{PREFERRED_DATE}}', preferredDate)
    .replace('{{CONSULTATION_FEE}}', consultationFee.toLocaleString());

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: '✓ Appointment Request Submitted - Philbox',
      html: emailTemplate,
    });

    if (error) {
      console.error(
        'Error sending appointment request submitted email:',
        error
      );
      throw error;
    }

    console.log('Appointment request submitted email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending appointment request submitted email:', error);
    throw error;
  }
};

/**
 * Send New Appointment Request Notification to Doctor
 * @param {string} email - Doctor email
 * @param {string} doctorName - Doctor's name
 * @param {string} patientName - Patient's name
 * @param {string} appointmentType - Type of appointment
 * @param {string} preferredDate - Preferred date and time
 * @param {string} consultationReason - Reason for consultation
 * @param {string} requestDate - When the request was made
 * @param {string} dashboardLink - Link to doctor's dashboard
 */
export const sendNewAppointmentRequestNotification = async (
  email,
  doctorName,
  patientName,
  appointmentType,
  preferredDate,
  consultationReason,
  requestDate,
  dashboardLink
) => {
  const formattedDoctorName = formatName(doctorName);
  const formattedPatientName = formatName(patientName);

  const emailTemplate = NEW_APPOINTMENT_REQUEST_NOTIFICATION_TEMPLATE.replace(
    /{{DOCTOR_NAME}}/g,
    formattedDoctorName
  )
    .replace(/{{PATIENT_NAME}}/g, formattedPatientName)
    .replace('{{APPOINTMENT_TYPE}}', appointmentType)
    .replace('{{PREFERRED_DATE}}', preferredDate)
    .replace('{{CONSULTATION_REASON}}', consultationReason)
    .replace('{{REQUEST_DATE}}', requestDate)
    .replace('{{DASHBOARD_LINK}}', dashboardLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: '🔔 New Appointment Request - Philbox',
      html: emailTemplate,
    });

    if (error) {
      console.error(
        'Error sending new appointment request notification:',
        error
      );
      throw error;
    }

    console.log('New appointment request notification sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending new appointment request notification:', error);
    throw error;
  }
};

/**
 * Send Appointment Request Accepted Notification to Patient
 * @param {string} email - Patient email
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentType - Type of appointment
 * @param {string} appointmentDate - Confirmed date and time
 * @param {number} consultationFee - Consultation fee amount
 * @param {string} notes - Optional notes from doctor
 * @param {string} dashboardLink - Link to patient's dashboard
 */
export const sendAppointmentRequestAccepted = async (
  email,
  patientName,
  doctorName,
  appointmentType,
  appointmentDate,
  consultationFee,
  notes,
  dashboardLink
) => {
  const greetingName = formatName(patientName);
  const formattedDoctorName = formatName(doctorName);

  let emailTemplate = APPOINTMENT_REQUEST_ACCEPTED_TEMPLATE.replace(
    /{{PATIENT_NAME}}/g,
    greetingName
  )
    .replace(/{{DOCTOR_NAME}}/g, formattedDoctorName)
    .replace('{{APPOINTMENT_TYPE}}', appointmentType)
    .replace('{{APPOINTMENT_DATE}}', appointmentDate)
    .replace('{{CONSULTATION_FEE}}', consultationFee.toLocaleString())
    .replace('{{DASHBOARD_LINK}}', dashboardLink);

  // Handle optional notes
  if (notes) {
    emailTemplate = emailTemplate
      .replace('{{#if NOTES}}', '')
      .replace('{{/if}}', '')
      .replace('{{NOTES}}', notes);
  } else {
    // Remove the notes section if not provided
    emailTemplate = emailTemplate.replace(/{{#if NOTES}}[\s\S]*?{{\/if}}/g, '');
  }

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: '✓ Appointment Confirmed - Philbox',
      html: emailTemplate,
    });

    if (error) {
      console.error('Error sending appointment accepted email:', error);
      throw error;
    }

    console.log('Appointment accepted email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending appointment accepted email:', error);
    throw error;
  }
};

/**
 * Send Appointment Request Rejected Notification to Patient
 * @param {string} email - Patient email
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor's name
 * @param {string} requestedDate - Originally requested date
 * @param {string} appointmentType - Type of appointment
 * @param {string} rejectionReason - Reason for rejection
 * @param {string} findDoctorsLink - Link to find other doctors
 */
export const sendAppointmentRequestRejected = async (
  email,
  patientName,
  doctorName,
  requestedDate,
  appointmentType,
  rejectionReason,
  findDoctorsLink
) => {
  const greetingName = formatName(patientName);
  const formattedDoctorName = formatName(doctorName);

  const emailTemplate = APPOINTMENT_REQUEST_REJECTED_TEMPLATE.replace(
    /{{PATIENT_NAME}}/g,
    greetingName
  )
    .replace(/{{DOCTOR_NAME}}/g, formattedDoctorName)
    .replace('{{REQUESTED_DATE}}', requestedDate)
    .replace('{{APPOINTMENT_TYPE}}', appointmentType)
    .replace('{{REJECTION_REASON}}', rejectionReason)
    .replace('{{FIND_DOCTORS_LINK}}', findDoctorsLink);

  try {
    const { data, error } = await brevo.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'philboxpk@gmail.com',
      subject: 'Appointment Request Update - Philbox',
      html: emailTemplate,
    });

    if (error) {
      console.error('Error sending appointment rejected email:', error);
      throw error;
    }

    console.log('Appointment rejected email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending appointment rejected email:', error);
    throw error;
  }
};
