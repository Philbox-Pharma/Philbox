const CURRENT_YEAR = new Date().getFullYear();

// 1. Generic OTP Template (2FA Login)
export const OTP_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; text-align: center; }
        .otp-code { font-size: 48px; font-weight: bold; color: #007bff; letter-spacing: 10px; margin: 20px 0; font-family: 'Courier New', monospace; }
        .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        @media only screen and (max-width: 600px) {
            .container { width: 100%; border-radius: 0; }
            .otp-code { font-size: 36px; letter-spacing: 5px; }
            .content { padding: 20px 15px; }
        }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1 style="margin: 0; font-size: 24px;">Two-Factor Authentication</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size: 16px; color: #333333; margin-bottom: 10px;">Hello {{NAME}},</p>
                <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">You are logging in to your Philbox <strong>{{ROLE}}</strong> account. Please use the following code to complete your login:</p>
                <div class="otp-code">
                    {{OTP}}
                </div>
                <p class="instructions">This code will expire in 5 minutes. Do not share it with anyone.</p>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>If you didn't attempt to login, please secure your account immediately.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

// 2. Generic Verification Template
export const VERIFICATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; text-align: center; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        @media only screen and (max-width: 600px) {
            .container { width: 100%; border-radius: 0; }
            .btn { padding: 10px 18px; font-size: 14px; }
            .content { padding: 20px 15px; }
        }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1>Welcome to Philbox!</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>
                <p class="instructions">Thank you for registering as a <strong>{{ROLE}}</strong>. To activate your account and access your dashboard, please verify your email address.</p>
                <a href="{{LINK}}" class="btn">Verify My Email</a>
                <p class="instructions" style="margin-top: 20px;">This link will expire in 24 hours.</p>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>If you didn't create an account, please ignore this email.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

// 3. Generic Reset Password Template
export const PASSWORD_RESET_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100%; border-radius: 0; }
      .btn { padding: 10px 18px; font-size: 14px; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Password Reset Request</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>
        <p class="instructions">We received a request to reset your password for your Philbox <strong>{{ROLE}}</strong> account.</p>
        <a href="{{LINK}}" class="btn">Reset Password</a>
        <p class="instructions">This link will expire in 10 minutes. If you didn’t request a password reset, please ignore this email.</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>If you didn’t request this, you can safely ignore this message.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 4. ✅ NEW: Generic Welcome / Account Created Template
export const WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Philbox</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #28a745; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .credentials-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: left; display: inline-block; width: 90%; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Welcome to the Team!</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>
        <p class="instructions">Your account has been successfully created as a <strong>{{ROLE}}</strong> at Philbox.</p>

        <div class="credentials-box">
            <p style="margin: 5px 0;"><strong>Login Email:</strong> {{EMAIL}}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> {{PASSWORD}}</p>
        </div>

        <p class="instructions">Please login immediately and change your password for security purposes.</p>
        <a href="{{LINK}}" class="btn">Login to Dashboard</a>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>Welcome aboard!</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 5. Doctor Application Approved Template
export const DOCTOR_APPLICATION_APPROVED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Approved</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #28a745; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .success-icon { font-size: 48px; color: #28a745; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .comment-box { background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; text-align: left; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>🎉 Application Approved!</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <div class="success-icon">✅</div>
        <p style="font-size:16px; color:#333;">Dear {{NAME}},</p>
        <p class="instructions">Congratulations! Your application to join Philbox as a doctor has been <strong>approved</strong>.</p>

        <div class="comment-box">
          <p style="margin: 0; color: #333;"><strong>Review Notes:</strong></p>
          <p style="margin: 10px 0 0 0; color: #666;">{{COMMENT}}</p>
        </div>

        <p class="instructions">Your account has been activated. You can now log in and complete your profile to start providing consultations.</p>
        <a href="{{LINK}}" class="btn">Login to Dashboard</a>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>Welcome to the Philbox medical team!</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 6. Doctor Application Rejected Template
export const DOCTOR_APPLICATION_REJECTED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #dc3545; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .warning-icon { font-size: 48px; color: #dc3545; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .comment-box { background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; text-align: left; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Application Status Update</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <div class="warning-icon">ℹ️</div>
        <p style="font-size:16px; color:#333;">Dear {{NAME}},</p>
        <p class="instructions">Thank you for your interest in joining Philbox. After careful review, we regret to inform you that your application cannot be approved at this time.</p>

        <div class="comment-box">
          <p style="margin: 0; color: #333;"><strong>Reason:</strong></p>
          <p style="margin: 10px 0 0 0; color: #666;">{{COMMENT}}</p>
        </div>

        <p class="instructions">If you believe this was in error or would like to reapply with updated documentation, please contact our support team.</p>
        <a href="{{LINK}}" class="btn">Contact Support</a>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 7. Doctor Status Update Template
export const DOCTOR_STATUS_UPDATE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Status Update</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; line-height: 1.6; color: #333; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100%; border-radius: 0; }
      .btn { padding: 10px 18px; font-size: 14px; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1 style="margin: 0; font-size: 24px;">Philbox</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 18px;">Account Status Update</h2>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Dear {{NAME}},</p>
        <p class="instructions">{{MESSAGE}}</p>
        {{LOGIN_BUTTON}}
        <p class="instructions">If you have any questions or concerns, please contact our support team.</p>
        <p style="margin-top: 20px;">Best regards,<br><strong>The Philbox Team</strong></p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 8. Medicine Refill Reminder Template
export const REFILL_REMINDER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medicine Refill Reminder</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; line-height: 1.6; color: #333; }
    .medicine-list { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .medicine-list ul { margin: 0; padding: 0 0 0 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100%; border-radius: 0; }
      .btn { padding: 10px 18px; font-size: 14px; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>💊 Philbox</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 18px;">Medicine Refill Reminder</h2>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Hello {{NAME}},</p>
        <p class="instructions">This is a friendly reminder to refill your medication(s):</p>
        <div class="medicine-list">
          <ul>{{MEDICINE_LIST}}</ul>
        </div>
        <p class="instructions">Remember to take your medications as prescribed to maintain your health and well-being.</p>
        <a href="{{LINK}}" class="btn">Browse Medicines</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          You can manage your medication reminders anytime from your account settings.
        </p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>This is an automated reminder from Philbox.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 9. Test Refill Reminder Template
export const TEST_REFILL_REMINDER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Refill Reminder</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .medicine-list { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .medicine-item { margin: 10px 0; padding: 10px; border-left: 4px solid #2563eb; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100%; border-radius: 0; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1 style="margin: 0;">💊 Test Medicine Refill Reminder</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello Test User,</p>
        <p class="instructions">This is a test reminder for your medication:</p>

        <div class="medicine-list">
          <div class="medicine-item">
            <strong>Test Medicine</strong> - 500mg
          </div>
        </div>

        <p class="instructions">This is a test notification from Philbox to verify the email delivery system is working correctly.</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>This is a test email from the Philbox notification system.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Appointment Request Templates
export const APPOINTMENT_REQUEST_SUBMITTED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Received</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .appointment-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #333; }
        .detail-value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1>Appointment Request Received</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size:16px; color:#333;">Hello {{PATIENT_NAME}},</p>
                <p style="color:#666; line-height:1.6;">Your appointment request has been successfully submitted. We have notified {{DOCTOR_NAME}}, who will review your request shortly.</p>

                <div class="appointment-details">
                    <h3 style="margin-top:0; color:#333;">Appointment Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">{{DOCTOR_NAME}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">{{APPOINTMENT_TYPE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Preferred Date:</span>
                        <span class="detail-value">{{PREFERRED_DATE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Consultation Fee:</span>
                        <span class="detail-value">PKR {{CONSULTATION_FEE}}</span>
                    </div>
                </div>

                <p style="color:#666; line-height:1.6;">You will receive a notification once the doctor responds to your request. Please keep an eye on your email and account dashboard.</p>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>Thank you for choosing Philbox for your healthcare needs.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const APPOINTMENT_REQUEST_ACCEPTED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Accepted</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #28a745; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .success-badge { background-color: #28a745; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .appointment-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #333; }
        .detail-value { color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1>Great News! Appointment Confirmed</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <div class="success-badge">✓ Appointment Accepted</div>

                <p style="font-size:16px; color:#333;">Hello {{PATIENT_NAME}},</p>
                <p style="color:#666; line-height:1.6;">{{DOCTOR_NAME}} has accepted your appointment request. Your consultation is now confirmed!</p>

                <div class="appointment-details">
                    <h3 style="margin-top:0; color:#333;">Confirmed Appointment Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">{{DOCTOR_NAME}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">{{APPOINTMENT_TYPE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">{{APPOINTMENT_DATE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Consultation Fee:</span>
                        <span class="detail-value">PKR {{CONSULTATION_FEE}}</span>
                    </div>
                    {{#if NOTES}}
                    <div class="detail-row">
                        <span class="detail-label">Doctor's Notes:</span>
                        <span class="detail-value">{{NOTES}}</span>
                    </div>
                    {{/if}}
                </div>

                <p style="color:#666; line-height:1.6;">Please arrive on time or log in to the online consultation platform a few minutes early. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>

                <a href="{{DASHBOARD_LINK}}" class="btn">View in Dashboard</a>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>We look forward to serving your healthcare needs.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const APPOINTMENT_REQUEST_REJECTED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Update</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #dc3545; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .rejection-badge { background-color: #dc3545; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .reason-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .appointment-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #333; }
        .detail-value { color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1>Appointment Request Update</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <div class="rejection-badge">Request Not Accepted</div>

                <p style="font-size:16px; color:#333;">Hello {{PATIENT_NAME}},</p>
                <p style="color:#666; line-height:1.6;">We regret to inform you that {{DOCTOR_NAME}} is unable to accept your appointment request at this time.</p>

                <div class="reason-box">
                    <strong style="color:#856404;">Reason:</strong>
                    <p style="color:#856404; margin:10px 0 0 0;">{{REJECTION_REASON}}</p>
                </div>

                <div class="appointment-details">
                    <h3 style="margin-top:0; color:#333;">Request Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">{{DOCTOR_NAME}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Requested Date:</span>
                        <span class="detail-value">{{REQUESTED_DATE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">{{APPOINTMENT_TYPE}}</span>
                    </div>
                </div>

                <p style="color:#666; line-height:1.6;">Don't worry! You can:</p>
                <ul style="color:#666; line-height:1.8;">
                    <li>Try booking with another available doctor</li>
                    <li>Request a different date/time slot</li>
                    <li>Contact our support team for assistance</li>
                </ul>

                <a href="{{FIND_DOCTORS_LINK}}" class="btn">Find Other Doctors</a>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>We're here to help you find the right healthcare provider.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const NEW_APPOINTMENT_REQUEST_NOTIFICATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Request</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .new-badge { background-color: #ff6b6b; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .patient-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #333; }
        .detail-value { color: #666; }
        .reason-box { background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <h1>New Appointment Request</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <div class="new-badge">🔔 New Request</div>

                <p style="font-size:16px; color:#333;">Hello Dr. {{DOCTOR_NAME}},</p>
                <p style="color:#666; line-height:1.6;">You have received a new appointment request from a patient. Please review the details and respond at your earliest convenience.</p>

                <div class="patient-details">
                    <h3 style="margin-top:0; color:#333;">Patient Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Patient Name:</span>
                        <span class="detail-value">{{PATIENT_NAME}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">{{APPOINTMENT_TYPE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Preferred Date:</span>
                        <span class="detail-value">{{PREFERRED_DATE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Requested:</span>
                        <span class="detail-value">{{REQUEST_DATE}}</span>
                    </div>
                </div>

                <div class="reason-box">
                    <strong style="color:#004085;">Consultation Reason:</strong>
                    <p style="color:#004085; margin:10px 0 0 0;">{{CONSULTATION_REASON}}</p>
                </div>

                <p style="color:#666; line-height:1.6;">Please log in to your dashboard to accept or decline this request. Timely responses help provide better patient care.</p>

                <a href="{{DASHBOARD_LINK}}" class="btn">Review Request</a>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>Thank you for being part of the Philbox healthcare network.</p>
                <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

// 11. Order Confirmation Template
export const ORDER_CONFIRMATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .summary-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: left; display: inline-block; width: 90%; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Order Confirmed</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>
        <p class="instructions">Thank you for your order. Your Philbox order <strong>#{{ORDER_ID}}</strong> has been confirmed successfully.</p>

        <div class="summary-box">
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> PKR {{TOTAL_AMOUNT}}</p>
          <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> {{ESTIMATED_DELIVERY}}</p>
        </div>

        <p class="instructions">You can track your order status anytime using the link below.</p>
        <a href="{{TRACK_LINK}}" class="btn">Track Your Order</a>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>If you have any questions, please contact Philbox support.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 12. Order Status Update Template
export const ORDER_STATUS_UPDATE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; color: #ffffff; }
    .status-confirmed { background-color: #28a745; }
    .status-processing { background-color: #ffc107; }
    .status-shipped { background-color: #17a2b8; }
    .status-delivered { background-color: #28a745; }
    .status-cancelled { background-color: #dc3545; }
    .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: bold; color: #333; }
    .detail-value { color: #666; }
    .detail-row:last-child { border-bottom: none; }
    .timeline { margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; }
    .timeline-item { margin: 15px 0; padding-left: 30px; position: relative; }
    .timeline-item:before { content: '✓'; position: absolute; left: 0; color: #28a745; font-weight: bold; }
    .timeline-item.pending:before { content: '○'; color: #ccc; }
    .timeline-text { color: #666; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .instructions { color: #666666; line-height: 1.5; margin-bottom: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    .unsubscribe { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; }
    .unsubscribe a { color: #007bff; text-decoration: none; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Order Status Update</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>

        <div style="text-align: center;">
          <span class="status-badge status-{{STATUS_CLASS}}">{{STATUS}}</span>
        </div>

        <p class="instructions">Your Philbox order <strong>#{{ORDER_ID}}</strong> has been {{STATUS_DESCRIPTION}}.</p>

        <div class="order-details">
          <div class="detail-row">
            <span class="detail-label">Order Number:</span>
            <span class="detail-value">#{{ORDER_ID}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Date:</span>
            <span class="detail-value">{{ORDER_DATE}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span class="detail-value"><strong>{{STATUS}}</strong></span>
          </div>
          {{#if TRACKING_NUMBER}}
          <div class="detail-row">
            <span class="detail-label">Tracking Number:</span>
            <span class="detail-value">{{TRACKING_NUMBER}}</span>
          </div>
          {{/if}}
          {{#if ESTIMATED_DELIVERY}}
          <div class="detail-row">
            <span class="detail-label">Estimated Delivery:</span>
            <span class="detail-value">{{ESTIMATED_DELIVERY}}</span>
          </div>
          {{/if}}
        </div>

        {{#if STATUS_MESSAGE}}
        <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #004085;"><strong>Update:</strong> {{STATUS_MESSAGE}}</p>
        </div>
        {{/if}}

        <div style="text-align: center; margin-top: 20px;">
          <a href="{{TRACK_LINK}}" class="btn">Track Order Details</a>
        </div>

        <p style="color:#666; line-height:1.6; margin-top: 30px;">Thank you for shopping with Philbox. If you have any questions or concerns about your order, please don't hesitate to contact us.</p>

        <div class="unsubscribe">
          <p style="margin: 0; color: #999; font-size: 12px;">
            Don't want to receive these emails? <a href="{{UNSUBSCRIBE_LINK}}">Unsubscribe from order notifications</a>
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>Thank you for choosing Philbox for your healthcare needs.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// 13. Complaint Status Update Template
export const COMPLAINT_STATUS_UPDATE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Status Update</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; color: #ffffff; }
    .status-open { background-color: #ffc107; color: #000; }
    .status-in-progress { background-color: #17a2b8; }
    .status-resolved { background-color: #28a745; }
    .status-closed { background-color: #6c757d; }
    .complaint-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: bold; color: #333; }
    .detail-value { color: #666; }
    .detail-row:last-child { border-bottom: none; }
    .resolution-box { background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
    .unsubscribe { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; }
    .unsubscribe a { color: #007bff; text-decoration: none; font-size: 12px; }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <h1>Complaint Status Update</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p style="font-size:16px; color:#333;">Hello {{NAME}},</p>

        <div style="text-align: center;">
          <span class="status-badge status-{{STATUS_CLASS}}">{{STATUS}}</span>
        </div>

        <p style="color:#666; line-height:1.6;">We have an update regarding your complaint. Below are the details:</p>

        <div class="complaint-details">
          <div class="detail-row">
            <span class="detail-label">Complaint ID:</span>
            <span class="detail-value">#{{COMPLAINT_ID}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Submitted Date:</span>
            <span class="detail-value">{{SUBMITTED_DATE}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">{{CATEGORY}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span class="detail-value"><strong>{{STATUS}}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Updated:</span>
            <span class="detail-value">{{LAST_UPDATED}}</span>
          </div>
        </div>

        {{#if STATUS_MESSAGE}}
        <div class="resolution-box">
          <p style="margin: 0; color: #004085;"><strong>{{STATUS_TITLE}}:</strong></p>
          <p style="margin: 10px 0 0 0; color: #004085;">{{STATUS_MESSAGE}}</p>
        </div>
        {{/if}}

        {{#if RESOLUTION_DETAILS}}
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Resolution Details:</p>
          <p style="margin: 0; color: #666; line-height: 1.6;">{{RESOLUTION_DETAILS}}</p>
        </div>
        {{/if}}

        <p style="color:#666; line-height:1.6; margin: 30px 0 0 0;">
          {{#if IS_RESOLVED}}
          Thank you for bringing this to our attention. We've worked diligently to resolve your complaint. We appreciate your patience and understanding.
          {{/if}}
          {{#if NOT_RESOLVED}}
          Our team is actively working on your complaint. We will update you as soon as we have more information.
          {{/if}}
        </p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="{{VIEW_COMPLAINT_LINK}}" class="btn">View Full Complaint Details</a>
        </div>

        <p style="color:#666; line-height:1.6; margin-top: 20px;">If you have further concerns or need to provide additional information, please don't hesitate to contact our support team.</p>

        <div class="unsubscribe">
          <p style="margin: 0; color: #999; font-size: 12px;">
            Don't want to receive these updates? <a href="{{UNSUBSCRIBE_LINK}}">Manage notification preferences</a>
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>We're committed to providing excellent customer service.</p>
        <p>&copy; ${CURRENT_YEAR} Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
