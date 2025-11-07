const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Make io accessible to routes
app.set('io', io);

// Import Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const tractorRoutes = require('./src/routes/tractors');
const bookingRoutes = require('./src/routes/bookings');
const paymentRoutes = require('./src/routes/payments');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tractors', tractorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tractor Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room for specific booking
  socket.on('join:booking', (bookingId) => {
    socket.join(`booking:${bookingId}`);
    console.log(`Socket ${socket.id} joined booking:${bookingId}`);
  });

  // Handle location updates during active booking
  socket.on('location:update', (data) => {
    const { bookingId, location } = data;
    // Broadcast location to all users in the booking room (except sender)
    socket.to(`booking:${bookingId}`).emit('location:updated', {
      bookingId,
      location,
      timestamp: new Date().toISOString()
    });
  });

  // Handle booking status changes
  socket.on('booking:status', (data) => {
    const { bookingId, status } = data;
    io.to(`booking:${bookingId}`).emit('booking:status:updated', {
      bookingId,
      status,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚜 Tractor Marketplace API running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
