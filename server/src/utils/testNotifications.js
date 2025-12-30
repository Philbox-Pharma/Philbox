/**
 * Test Script for Refill Reminder Notifications
 *
 * This script helps test the notification service independently
 * Run with: node server/src/utils/testNotifications.js
 */

import notificationService from './notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('\n📧 Testing Email Notification...');

  const result = await notificationService.sendEmail(
    process.env.TEST_EMAIL || 'test@example.com',
    '💊 Test Refill Reminder',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Medicine Refill Reminder</h2>
        <p>Hello Test User,</p>
        <p>This is a test reminder for your medication:</p>
        <ul style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <li><strong>Test Medicine</strong> - 500mg</li>
        </ul>
        <p>This is a test notification from Philbox.</p>
      </div>
    `
  );

  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ Email failed:', result.error);
  }
};

const testSMS = async () => {
  console.log('\n📱 Testing SMS Notification...');

  const phoneNumber = process.env.TEST_PHONE_NUMBER;

  if (!phoneNumber) {
    console.log('⚠️  TEST_PHONE_NUMBER not set in .env, skipping SMS test');
    return;
  }

  const result = await notificationService.sendSMS(
    phoneNumber,
    'Test Medicine Refill Reminder: Time to refill your medication! - Philbox'
  );

  if (result.success) {
    console.log('✅ SMS sent successfully!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ SMS failed:', result.error);
  }
};

const testPush = async () => {
  console.log('\n🔔 Testing Push Notification...');

  const result = await notificationService.sendPushNotification(
    'test-user-id',
    'Test Medicine Refill Reminder',
    'Time to refill your medication!'
  );

  if (result.success) {
    console.log('✅ Push notification queued:', result.message);
  } else {
    console.log('❌ Push notification failed:', result.error);
  }
};

const runTests = async () => {
  console.log('='.repeat(50));
  console.log('🧪 Refill Reminder Notification Tests');
  console.log('='.repeat(50));

  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log(
    'EMAIL_PASSWORD:',
    process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'
  );
  console.log(
    'TWILIO_ACCOUNT_SID:',
    process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '⚠️  Not set (optional)'
  );
  console.log(
    'TWILIO_AUTH_TOKEN:',
    process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '⚠️  Not set (optional)'
  );
  console.log(
    'TWILIO_PHONE_NUMBER:',
    process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '⚠️  Not set (optional)'
  );

  // Run tests
  await testEmail();
  await testSMS();
  await testPush();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests completed!');
  console.log('='.repeat(50) + '\n');

  process.exit(0);
};

// Run the tests
runTests().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
