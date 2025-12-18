import { transporter } from '../config/nodemailer.config.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  OTP_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  DOCTOR_APPLICATION_APPROVED_TEMPLATE,
  DOCTOR_APPLICATION_REJECTED_TEMPLATE,
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Philbox - Verify Your ${role} Account`,
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error(`Error sending ${role} verification email:`, error);
    }
    console.log(`${role} verification email sent: ${info.response}`);
  });
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Philbox - Reset ${role} Password`,
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error(`Error sending ${role} reset email:`, error);
    }
    console.log(`${role} password reset email sent: ${info.response}`);
  });
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Philbox - ${role} Login Verification`,
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error(`Error sending ${role} OTP email:`, error);
    }
    console.log(`${role} OTP email sent: ${info.response}`);
  });
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to Philbox - Your ${role} Account`,
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error(`Error sending ${role} welcome email:`, error);
    }
    console.log(`${role} welcome email sent: ${info.response}`);
  });
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Your Doctor Application Has Been Approved',
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending application approved email:', error);
    }
    console.log('Application approved email sent: ' + info.response);
  });
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

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Application Status Update',
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending application rejected email:', error);
    }
    console.log('Application rejected email sent: ' + info.response);
  });
};
