require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
// Files router handles both POST /upload and GET /:filename + serves static files
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1', homeRoutes);

// Actuator health endpoint (mirrors Spring Boot Actuator)
app.get('/actuator/health', (req, res) => res.json({ status: 'UP' }));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io chat
initSocket(io);

// DB sync & start
const PORT = process.env.PORT || 8080;
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully.');
    
    // Seed/Update Governance Admin Account
    try {
      const bcrypt = require('bcryptjs');
      const { User } = require('./src/models/index');
      const existing = await User.findOne({ where: { email: 'governance@gmail.com' } });
      const hashed = await bcrypt.hash('12345', 10);
      
      if (existing) {
        await existing.update({ password: hashed, role: 'ADMIN', verificationStatus: 'VERIFIED' });
        console.log('Governance Admin account successfully verified/updated with password: 12345');
      } else {
        await User.create({
          fullName: 'Governance Admin',
          email: 'governance@gmail.com',
          password: hashed,
          role: 'ADMIN',
          verificationStatus: 'VERIFIED'
        });
        console.log('Governance Admin account successfully created with password: 12345');
      }
    } catch (err) {
      console.error('Failed to seed governance admin:', err);
    }

    server.listen(PORT, () => console.log(`Health Horizon backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });
