import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback sender email
export const fromEmail = process.env.EMAIL_USER;
