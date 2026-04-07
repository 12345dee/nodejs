const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'dev';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

app.use(express.json());

// Simple request logger (useful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from DevOps Node App!',
    environment: APP_ENV,
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Health check (Docker + K8s liveness)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: APP_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Readiness check (K8s readiness)
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    environment: APP_ENV
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: APP_VERSION,
    environment: APP_ENV,
    nodeVersion: process.version
  });
});

// Start server (bind to all interfaces for Docker)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${APP_ENV.toUpperCase()}] Server running on port ${PORT}`);
  console.log(`Version: ${APP_VERSION}`);
});

// Graceful shutdown (important for Kubernetes)
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
