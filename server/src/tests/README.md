# Tests Directory Map

This directory is organized by test type and execution mode.

## Structure

- `docs/`
  - `Sockets_Testing_Guide.md` - Manual API + Socket testing guide
- `manual/web/fcm/`
  - `fcm-token-test.html` - Browser page to generate an FCM token
  - `firebase-messaging-sw.js` - Service worker used by the FCM token test page
- `manual/web/sockets/`
  - `socket-test-client.html` - Manual Socket.IO event test client
- `manual/web/consultations/`
  - `video-consultation-test.html` - Doctor/customer WebRTC consultation test lab
- `manual/web/orders/`
  - `order-processing-flow-test.html` - Customer cart -> checkout -> salesperson processing lab
- `scripts/unit-tests/`
  - `run.js` - Route-module unit checks for all server actors
- `scripts/integration-tests/`
  - `run.js` - Middleware and route-chain integration checks
- `scripts/system-tests/`
  - `run.js` - Actor-wide server route coverage checks
- `scripts/acceptance-testing/`
  - `run.js` - End-user journey coverage checks
- `scripts/performance-testing/`
  - `run.js` - Route load timing checks
- `scripts/security-testing/`
  - `run.js` - Access-control and auth-marker checks
- `scripts/usability-testing/`
  - `run.js` - Endpoint readability and naming checks
- `scripts/compatibility-testing/`
  - `run.js` - ESM and HTTP-method compatibility checks
- `scripts/runAllServerTests.js`
  - Runs every server test category in the required order: admin, salesperson, doctor, customer
- `scripts/notifications/`
  - `testNotifications.js` - Email/SMS/Push notification integration checks
- `scripts/medicines/`
  - `testMedicineCatalogRanking.js` - Verifies medicine suggestions follow cart-priority or proximity ranking
- `scripts/orders/`
  - `testOrderProcessingRealtime.js` - Real-time order event listener test
- `scripts/payments/`
  - `testStripeTransaction.js` - Stripe test PaymentIntent script

## Generated CSV Reports

Each server category writes a CSV into `src/tests/Document/`:

- `unit-tests.csv`
- `integration-tests.csv`
- `system-tests.csv`
- `acceptance-testing.csv`
- `performance-testing.csv`
- `security-testing.csv`
- `usability-testing.csv`
- `compatibility-testing.csv`

## Quick Run Commands

From `server/`:

```bash
node src/tests/scripts/runAllServerTests.js
node src/tests/scripts/notifications/testNotifications.js
node src/tests/scripts/medicines/testMedicineCatalogRanking.js
node src/tests/scripts/orders/testOrderProcessingRealtime.js
node src/tests/scripts/payments/testStripeTransaction.js
```

For browser-based manual tests, serve `server/src/tests` with a local HTTP server and open:

- `http://localhost:8000/manual/web/fcm/fcm-token-test.html`
- `http://localhost:8000/manual/web/sockets/socket-test-client.html`
- `http://localhost:8000/manual/web/consultations/video-consultation-test.html`
- `http://localhost:8000/manual/web/orders/order-processing-flow-test.html`

If your consultation page is hosted on a different origin in production, start the backend with a matching `FRONTEND_URL` so the Socket.IO CORS check accepts the page. Do not use `file://` for login-based manual tests; session cookies are not reliable there, and protected endpoints will return `401` after login.
