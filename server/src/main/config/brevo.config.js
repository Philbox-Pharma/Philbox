import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send email using Brevo API
 * @param {Object} emailData - Email configuration object
 * @returns {Promise<Object>} Response from Brevo API
 */
export const brevo = {
  emails: {
    send: async emailData => {
      const { from, to, subject, html, replyTo } = emailData;

      // Parse from email if it contains name
      const fromMatch = from.match(/(.+?)\s*<(.+?)>/) || [
        null,
        process.env.EMAIL_NAME || 'PhilBox',
        from,
      ];
      const fromName =
        fromMatch[1]?.trim() || process.env.EMAIL_NAME || 'PhilBox';
      const fromEmail = fromMatch[2]?.trim() || from;

      const payload = {
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      };

      if (replyTo) {
        payload.replyTo = {
          email: replyTo,
        };
      }

      try {
        const response = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: result,
          };
        }

        return {
          data: { id: result.messageId },
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: error.message,
        };
      }
    },
  },
};

export const fromEmail = `${process.env.EMAIL_NAME || 'PhilBox'} <${process.env.EMAIL_USER}>`;
