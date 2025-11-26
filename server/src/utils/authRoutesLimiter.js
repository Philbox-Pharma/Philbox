import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();
const mili_seconds = Number(process.env.LIMIT_MILISECONDS);

const seconds = mili_seconds / 1000;
const minutes = seconds / 60;
const rateLimitSpecs = {
  windowMs: mili_seconds, // 10 minutes
  max: 5, // only five attempts per 10 minutes
  message: {
    message: `Too many attempts. Please try again after ${minutes} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const authRoutesLimiter = rateLimit(rateLimitSpecs);
