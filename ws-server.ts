import { Server } from 'socket.io';

interface MessageData {
  roomId: string;
  message: string;
  userId: string;
  username: string;
}

interface TypingData {
  roomId: string;
  userId: string;
  username: string;
}

const io = new Server(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', (data: MessageData) => {
    const { roomId, message, userId, username } = data;
    
    io.to(roomId).emit('receive-message', {
      message,
      userId,
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing', (data: TypingData) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('stop-typing', (data: { roomId: string; userId: string }) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

console.log('🚀 Socket.io server running on port 3001');