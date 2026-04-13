let _io = null;

function initIO(server) {
  const { Server } = require('socket.io');
  _io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  _io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    socket.on('register', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
      socket.join(`user:${userId}`);
      console.log(`[Socket] User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSocketMap.has(socket.userId)) {
        userSocketMap.get(socket.userId).delete(socket.id);
        if (userSocketMap.get(socket.userId).size === 0) {
          userSocketMap.delete(socket.userId);
        }
      }
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });

  _io._userSocketMap = userSocketMap;
  return _io;
}

function getIO() {
  if (!_io) {
    throw new Error('Socket.IO has not been initialized. Call initIO(server) first.');
  }
  return _io;
}

module.exports = { initIO, getIO };
