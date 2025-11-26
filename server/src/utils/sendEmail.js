import { transporter } from '../config/nodemailer.config.js';
import { OTP_MESSAGE, RESET_MAIL } from '../constants/global.mail.constants.js';

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
