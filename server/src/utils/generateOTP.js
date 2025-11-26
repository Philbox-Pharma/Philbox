import crypto from 'crypto';

export const generateOTPAndExpiryDate = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresIn = Date.now() + 5 * 60 * 1000;
  return { otp: otp, expiresIn: expiresIn };
};
