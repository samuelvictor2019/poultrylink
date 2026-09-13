const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.set('trust proxy', 1); 

app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
}));
app.express.json();
app.use(express.urlencoded({ extended: true }));

app.get('/api/check', (req, res) => res.join({
    status: 'ok',
    uptime: process.uptime()
}));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Handle unhandled promise rejections (e.g, distance connection errors)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close the database connection
    server.close(async () => {
        await disconnectDB();
        // Exit the process
        process.exit(1);
    });
});

// Handle uncaught exceptions (e.g, syntax errors)
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    // Close the database connection
    await disconnectDB();
    // Exit the process
    process.exit(1);
});

// Graceful shutdown on SIGTERM or SIGINT (e.g, when the process is killed or interrupted)  
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});