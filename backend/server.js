const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./src/config/env');
const authRoutes = require('./src/routes/auth.routes');
const { connectDB, disconnectDB } = require('./src/config/dbHandler');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');

const app = express();
app.set('trust proxy', 1); 

app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.get('/api/check', (req, res) => res.json({
    status: 'ok',
    uptime: process.uptime()
}));
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
    };
    if (err.details) response.details = err.details;
    if (statusCode === 500) console.error(err);
    res.status(statusCode).json(response);
});

const PORT = env.PORT;
let server;

async function startServer() {
    await connectDB();
    server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

startServer().catch((err) => {
    console.error('Server startup failed:', err);
    process.exit(1);
});

// Handle unhandled promise rejections (e.g, distance connection errors)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions (e.g, syntax errors)
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown on SIGTERM or SIGINT (e.g, when the process is killed or interrupted)  
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    const closeServer = server ? (callback) => server.close(callback) : (callback) => callback();
    closeServer(async () => {
        await disconnectDB();
        process.exit(0);
    });
});