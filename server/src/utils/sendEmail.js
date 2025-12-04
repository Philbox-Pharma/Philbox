import { transporter } from '../config/nodemailer.config.js';
import {
  OTP_MESSAGE,
  RESET_MAIL,
  DOCTOR_VERIFICATION_TEMPLATE,
  DOCTOR_RESET_TEMPLATE,
} from '../constants/global.mail.constants.js';

export const sendResetEmail = async (email, resetLink, name) => {
  let message = RESET_MAIL.replace('<<RESET_LINK>>', resetLink);
  message = message.replace('<<2025>>', new Date().getFullYear());
  message = message.replace(
    '<<Hello,>>',
    `Hello ${name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')}`
  );

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Reset Your Password',
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending reset email:', error);
    }
    console.log(`Password reset email sent: ${info.response}`);
  });
};

export const sendOTP = async (email, otp) => {
  let message = OTP_MESSAGE.replace('<<123456>>', otp);
  message = message.replace('<<2025>>', new Date().getFullYear());

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Login OTP',
    html: message,
  };
  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return `Error occured ${console.log(error)}`;
    }
    console.log(`Email sent successfully: ${info.response}`);
  });
};

// ✅ DOCTOR: Send Email Verification Link
export const sendVerificationEmail = async (email, verificationLink, name) => {
  let message = DOCTOR_VERIFICATION_TEMPLATE.replace(
    '<<VERIFY_LINK>>',
    verificationLink
  );
  message = message.replace('<<2025>>', new Date().getFullYear());

  // Format Name: "Dr. John Doe"
  const formattedName = name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  message = message.replace('<<Hello,>>', `Hello Dr. ${formattedName},`);

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Verify Your Doctor Account',
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending verification email:', error);
    }
    console.log(`Verification email sent: ${info.response}`);
  });
};

// ✅ DOCTOR: Send Password Reset Link
export const sendDoctorResetEmail = async (email, resetLink, name) => {
  let message = DOCTOR_RESET_TEMPLATE.replace('<<RESET_LINK>>', resetLink);
  message = message.replace('<<2025>>', new Date().getFullYear());

  const formattedName = name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  message = message.replace('<<Hello,>>', `Hello Dr. ${formattedName},`);

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Philbox - Reset Doctor Password',
    html: message,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending doctor reset email:', error);
    }
    console.log(`Doctor password reset email sent: ${info.response}`);
  });
};
