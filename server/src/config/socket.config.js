import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', socket => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join salesperson room
    socket.on('join:salesperson', salespersonId => {
      socket.join(`salesperson:${salespersonId}`);
      console.log(`Salesperson ${salespersonId} joined room`);
    });

    // Join admin room
    socket.on('join:admin', adminId => {
      socket.join(`admin:${adminId}`);
      console.log(`Admin ${adminId} joined room`);
    });

    // Join branch room (for branch-level notifications)
    socket.on('join:branch', branchId => {
      socket.join(`branch:${branchId}`);
      console.log(`User joined branch ${branchId} room`);
    });

    // Leave rooms on disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

/**
 * Emit task event to specific salesperson
 * @param {string} salespersonId - Salesperson ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitToSalesperson = (salespersonId, event, data) => {
  if (io) {
    io.to(`salesperson:${salespersonId}`).emit(event, data);
  }
};

/**
 * Emit task event to specific admin
 * @param {string} adminId - Admin ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitToAdmin = (adminId, event, data) => {
  if (io) {
    io.to(`admin:${adminId}`).emit(event, data);
  }
};

/**
 * Emit task event to entire branch
 * @param {string} branchId - Branch ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitToBranch = (branchId, event, data) => {
  if (io) {
    io.to(`branch:${branchId}`).emit(event, data);
  }
};

/**
 * Broadcast task event to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
