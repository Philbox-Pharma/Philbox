import { Server } from 'socket.io';
import consultationService from '../modules/shared/consultations/service/consultation.service.js';

let io;
const latestConsultationOffers = new Map();

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = httpServer => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const normalizedOrigin = String(origin || '').replace(/\/$/, '');
        const configuredOrigin = String(
          process.env.FRONTEND_URL || 'http://localhost:5173'
        ).replace(/\/$/, '');

        if (!normalizedOrigin || normalizedOrigin === 'null') {
          if (isDevelopment) {
            return callback(null, true);
          }

          return callback(new Error('Not allowed by CORS'));
        }

        if (
          normalizedOrigin === configuredOrigin ||
          (isDevelopment &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
              normalizedOrigin
            ))
        ) {
          return callback(null, true);
        }

        console.warn('Socket.IO blocked origin:', origin);
        console.warn('Allowed socket origin:', configuredOrigin);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', socket => {
    console.log(`✅ Socket connected: ${socket.id}`);

    const getActorContext = payload => {
      const auth = socket.handshake.auth || {};
      const body = payload || {};

      return {
        userId: auth.userId || auth.id || body.userId || body.id || null,
        role: auth.role || body.role || null,
      };
    };

    const getRoomName = appointmentId => `consultation:${appointmentId}`;

    // Generic join event (for test client)
    socket.on('join', ({ room }) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      socket.emit('joined', { room, socketId: socket.id });
    });

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

    socket.on('consultation:join', async payload => {
      try {
        const { appointmentId } = payload || {};
        const { userId, role } = getActorContext(payload);

        if (!appointmentId || !userId || !role) {
          socket.emit('consultation:error', {
            message: 'appointmentId, userId, and role are required',
          });
          return;
        }

        const session = await consultationService.joinConsultation({
          appointmentId,
          userRole: role,
          userId,
        });

        const roomName = session.room_name || getRoomName(appointmentId);
        socket.join(roomName);
        socket.emit('consultation:joined', {
          room_name: roomName,
          session,
        });

        if (role === 'customer' && latestConsultationOffers.has(roomName)) {
          socket.emit(
            'consultation:offer',
            latestConsultationOffers.get(roomName)
          );
        }

        socket.to(roomName).emit('consultation:participant-joined', {
          room_name: roomName,
          participant_role: session.participant_role,
        });
      } catch (error) {
        socket.emit('consultation:error', {
          message: error.message || 'Failed to join consultation',
        });
      }
    });

    socket.on('consultation:start', async payload => {
      try {
        const { appointmentId } = payload || {};
        const { userId, role } = getActorContext(payload);

        if (!appointmentId || !userId || role !== 'doctor') {
          socket.emit('consultation:error', {
            message: 'Only a doctor can start the consultation',
          });
          return;
        }

        const session = await consultationService.startConsultation({
          appointmentId,
          doctorId: userId,
        });

        const roomName = session.room_name || getRoomName(appointmentId);
        socket.join(roomName);
        io.to(roomName).emit('consultation:started', {
          room_name: roomName,
          session,
        });
      } catch (error) {
        socket.emit('consultation:error', {
          message: error.message || 'Failed to start consultation',
        });
      }
    });

    socket.on('consultation:end', async payload => {
      try {
        const { appointmentId, recordingUrl, notes } = payload || {};
        const { userId, role } = getActorContext(payload);

        if (!appointmentId || !userId || role !== 'doctor') {
          socket.emit('consultation:error', {
            message: 'Only a doctor can end the consultation',
          });
          return;
        }

        const session = await consultationService.endConsultation({
          appointmentId,
          doctorId: userId,
          recordingUrl,
          notes,
        });

        const roomName = session.room_name || getRoomName(appointmentId);
        latestConsultationOffers.delete(roomName);
        io.to(roomName).emit('consultation:ended', {
          room_name: roomName,
          session,
        });
      } catch (error) {
        socket.emit('consultation:error', {
          message: error.message || 'Failed to end consultation',
        });
      }
    });

    socket.on('consultation:message', async payload => {
      try {
        const { appointmentId, text, mediaUrl } = payload || {};
        const { userId, role } = getActorContext(payload);

        if (!appointmentId || !userId || !role) {
          socket.emit('consultation:error', {
            message: 'appointmentId, userId, and role are required',
          });
          return;
        }

        const result = await consultationService.sendMessage({
          appointmentId,
          userRole: role,
          userId,
          text,
          mediaUrl: mediaUrl || null,
        });

        io.to(result.room_name).emit('consultation:message', result.message);
      } catch (error) {
        socket.emit('consultation:error', {
          message: error.message || 'Failed to send consultation message',
        });
      }
    });

    socket.on('consultation:offer', payload => {
      const { appointmentId, offer } = payload || {};
      if (!appointmentId || !offer) return;

      const roomName = getRoomName(appointmentId);
      latestConsultationOffers.set(roomName, offer);
      socket.to(roomName).emit('consultation:offer', offer);
    });

    socket.on('consultation:answer', payload => {
      const { appointmentId, answer } = payload || {};
      if (!appointmentId || !answer) return;
      socket.to(getRoomName(appointmentId)).emit('consultation:answer', answer);
    });

    socket.on('consultation:ice-candidate', payload => {
      const { appointmentId, candidate } = payload || {};
      if (!appointmentId || !candidate) return;
      socket
        .to(getRoomName(appointmentId))
        .emit('consultation:ice-candidate', candidate);
    });

    socket.on('consultation:leave', payload => {
      const { appointmentId } = payload || {};
      if (!appointmentId) return;
      const roomName = getRoomName(appointmentId);
      socket.leave(roomName);
      socket.to(roomName).emit('consultation:participant-left', {
        room_name: roomName,
      });
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
