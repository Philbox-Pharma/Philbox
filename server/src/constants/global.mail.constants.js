export const OTP_MESSAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 10px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        .instructions {
            color: #666666;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
                border-radius: 0;
            }
            .otp-code {
                font-size: 36px;
                letter-spacing: 5px;
            }
            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <tr>
            <td class="header" style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Your OTP Code</h1>
            </td>
        </tr>
        <tr>
            <td class="content" style="padding: 30px 20px; text-align: center;">
                <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Use this one-time password to verify your identity.</p>
                <div class="otp-code" style="font-size: 48px; font-weight: bold; color: #007bff; letter-spacing: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
                    <<123456>>
                </div>
                <p class="instructions" style="color: #666666; line-height: 1.5; margin-bottom: 20px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
            </td>
        </tr>
        <tr>
            <td class="footer" style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                <p style="margin: 0;">If you didn't request this code, please ignore this email.</p>
                <p style="margin: 5px 0 0 0;">&copy; <<2025>> Philbox. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const RESET_MAIL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: #ffffff !important;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
    }
    .instructions {
      color: #666666;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #999999;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
        border-radius: 0;
      }
      .btn {
        padding: 10px 18px;
        font-size: 14px;
      }
      .content {
        padding: 20px 15px;
      }
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
        <p style="font-size:16px; color:#333;"><<Hello,>></p>
        <p class="instructions">We received a request to reset your password. Click the button below to reset it.</p>
        <a href="<<RESET_LINK>>" class="btn">Reset Password</a>
        <p class="instructions">This link will expire in 10 minutes. If you didn’t request a password reset, please ignore this email.</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>If you didn’t request this, you can safely ignore this message.</p>
        <p>&copy; <<2025>> Philbox. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
