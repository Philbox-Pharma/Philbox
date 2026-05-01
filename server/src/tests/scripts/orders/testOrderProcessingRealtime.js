import dotenv from 'dotenv';
import { io } from 'socket.io-client';

dotenv.config();

const socketUrl = process.env.SOCKET_URL || 'http://localhost:5000';
const salespersonId = process.env.TEST_SALESPERSON_ID;
const branchId = process.env.TEST_BRANCH_ID;

if (!salespersonId) {
  console.error('ERROR: TEST_SALESPERSON_ID is required.');
  console.error(
    'Example: TEST_SALESPERSON_ID=66... node src/tests/scripts/orders/testOrderProcessingRealtime.js'
  );
  process.exit(1);
}

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

const logEvent = (label, data) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${label}`);
  console.log(JSON.stringify(data, null, 2));
};

console.log('='.repeat(72));
console.log('Salesperson Order Processing Realtime Test');
console.log('='.repeat(72));
console.log('Socket URL:', socketUrl);
console.log('Salesperson ID:', salespersonId);
console.log('Branch ID:', branchId || '(not set)');
console.log('Listening for: new_order_available, order:status_updated');
console.log('='.repeat(72));

socket.on('connect', () => {
  console.log(`[connected] socket id: ${socket.id}`);

  socket.emit('join:salesperson', salespersonId);
  console.log(`[join] salesperson:${salespersonId}`);

  if (branchId) {
    socket.emit('join:branch', branchId);
    console.log(`[join] branch:${branchId}`);
  }
});

socket.on('joined', data => {
  logEvent('joined', data);
});

socket.on('new_order_available', data => {
  logEvent('new_order_available', data);
});

socket.on('order:status_updated', data => {
  logEvent('order:status_updated', data);
});

socket.on('connect_error', error => {
  console.error('[connect_error]', error.message);
});

socket.on('disconnect', reason => {
  console.log(`[disconnected] ${reason}`);
});

process.on('SIGINT', () => {
  console.log('\n[exit] shutting down test client...');
  socket.disconnect();
  process.exit(0);
});
