
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const { sequelize } = require('./src/config/database');
const initSocket = require('./src/socket/chat');
const errorHandler = require('./src/middleware/errorHandler');

// Import application routes
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

// Configure permitted frontend origins.
// Set FRONTEND_URL as a comma-separated list in the environment.
const allowedOrigins = (
    process.env.FRONTEND_URL ||
    'http://localhost,http://127.0.0.1,http://localhost:5173,http://127.0.0.1:5173'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow requests without an Origin header, such as server-to-server
        // requests and local command-line health checks.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
};

// Socket.IO uses the same origin policy as Express.
const io = new Server(server, {
    cors: corsOptions
});

app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));
app.use(morgan('dev'));

// API routes
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

// Database-aware health endpoint.
// Returns HTTP 503 if PostgreSQL is unavailable.
app.get('/actuator/health', async (req, res) => {
    try {
        await sequelize.authenticate();

        return res.status(200).json({
            status: 'UP',
            components: {
                database: 'UP'
            }
        });
    } catch (error) {
        console.error(
            '[Health Check] Database connection failed:',
            error.message
        );

        return res.status(503).json({
            status: 'DOWN',
            components: {
                database: 'DOWN'
            }
        });
    }
});

// Error handler must be registered after all routes.
app.use(errorHandler);

// Initialize authenticated Socket.IO functionality.
initSocket(io);

// Server configuration
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

// Initialize database before accepting requests.
const startServer = async () => {
    try {
        // Verify the database connection.
        await sequelize.authenticate();

        console.log('PostgreSQL connection established.');

        // Create missing tables without automatically altering
        // existing database table structures.
        await sequelize.sync();

        console.log('Database synchronization completed.');

        server.listen(PORT, HOST, () => {
            console.log(
                `Health Horizon backend running on ${HOST}:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            'Backend startup failed:',
            error.message
        );

        process.exit(1);
    }
};

// Graceful shutdown.
const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);

    server.close(async () => {
        try {
            await sequelize.close();
            console.log('Database connection closed.');
            process.exit(0);
        } catch (error) {
            console.error('Shutdown error:', error.message);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('Graceful shutdown timed out.');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
