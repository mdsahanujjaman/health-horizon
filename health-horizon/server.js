require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const { sequelize } = require('./src/config/database');
const initSocket = require('./src/socket/chat');
const errorHandler = require('./src/middleware/errorHandler');

// Import all routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const appointmentRoutes = require('./src/routes/appointments');
const doctorRoutes = require('./src/routes/doctors');
const patientRoutes = require('./src/routes/patients');
const profileRoutes = require('./src/routes/profile');
const chatRoutes = require('./src/routes/chat');
const medicalRecordRoutes = require('./src/routes/medicalRecords');
const prescriptionRoutes = require('./src/routes/prescriptions');
const labRoutes = require('./src/routes/lab');
const paymentRoutes = require('./src/routes/payments');
const notificationRoutes = require('./src/routes/notifications');
const pillReminderRoutes = require('./src/routes/pillReminders');
const healthMetricRoutes = require('./src/routes/healthMetrics');
const counselingRoutes = require('./src/routes/counseling');
const aiRoutes = require('./src/routes/ai');
const analyticsRoutes = require('./src/routes/analytics');
const governanceRoutes = require('./src/routes/governance');
const fileRoutes = require('./src/routes/files');
const homeRoutes = require('./src/routes/home');

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost,http://localhost:80,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const originAllowed = (origin) => !origin || allowedOrigins.includes(origin);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, originAllowed(origin)),
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// Middleware
app.use(cors({ origin: (origin, callback) => callback(null, originAllowed(origin)) }));
// Bound request-body parsing to reduce memory-exhaustion risk. Multipart uploads
// are handled separately by Multer with their own file and part limits.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/messages', chatRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/pill-reminders', pillReminderRoutes);
app.use('/api/v1/health-metrics', healthMetricRoutes);
app.use('/api/v1/counseling', counselingRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1', homeRoutes);

// Health endpoint
app.get('/actuator/health', (req, res) => res.json({ status: 'UP' }));

// Error handler must be registered last.
app.use(errorHandler);

// Socket.io chat
initSocket(io);

const PORT = Number.parseInt(process.env.PORT, 10) || 8080;

async function bootstrapGovernanceAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  // Bootstrap is opt-in. Never create a known default password or overwrite
  // an existing administrator's credentials during application startup.
  if (!email && !password) {
    console.log('Governance admin bootstrap skipped (credentials not configured).');
    return;
  }
  if (!email || !password || password.length < 12) {
    throw new Error('Set both ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD (minimum 12 characters), or leave both unset.');
  }

  const { User } = require('./src/models/index');
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('Governance admin bootstrap skipped (account already exists).');
    return;
  }

  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    fullName: 'Governance Admin',
    email,
    password: hashed,
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
  });
  console.log('Governance admin account created from environment configuration.');
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Avoid automatic schema alterations at application startup.
    console.log('Database connection established and models synchronized.');
    await bootstrapGovernanceAdmin();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Health Horizon backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error);
    process.exit(1);
  }
}

start();
