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

  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
      .content { padding: 20px 0; line-height: 1.6; color: #333; }
      .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Philbox</h1>
        <h2>Account Status Update</h2>
      </div>
      <div class="content">
        <p>Dear ${greetingName},</p>
        <p>${message}</p>
        ${
          status === 'active'
            ? '<a href="' +
              process.env.FRONTEND_URL +
              '/doctor/auth/login" class="button">Login to Your Account</a>'
            : ''
        }
        <p>If you have any questions or concerns, please contact our support team.</p>
        <p>Best regards,<br>The Philbox Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Philbox. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: emailTemplate,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending status update email:', error);
    }
    console.log('Status update email sent: ' + info.response);
  });
};

/**
 * Generic Email Sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
export const sendEmail = async (to, subject, htmlContent) => {
  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent successfully: ' + info.response);
        resolve({ success: true, messageId: info.messageId });
      }
    });
  });
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

  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
      .header h1 { color: #2563eb; margin: 0; }
      .content { padding: 20px 0; line-height: 1.6; color: #333; }
      .medicine-list { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .medicine-list ul { margin: 0; padding: 0 0 0 20px; }
      .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>💊 Philbox</h1>
        <h2>Medicine Refill Reminder</h2>
      </div>
      <div class="content">
        <p>Hello ${greetingName},</p>
        <p>This is a friendly reminder to refill your medication(s):</p>
        <div class="medicine-list">
          <ul>${medicineList}</ul>
        </div>
        <p>Remember to take your medications as prescribed to maintain your health and well-being.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/medicines" class="button">Browse Medicines</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          You can manage your medication reminders anytime from your account settings.
        </p>
      </div>
      <div class="footer">
        <p>This is an automated reminder from Philbox.</p>
        <p>&copy; ${new Date().getFullYear()} Philbox. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '💊 Medicine Refill Reminder - Philbox',
    html: emailTemplate,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.error('Error sending refill reminder email:', error);
        reject(error);
      } else {
        console.log('Refill reminder email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};
