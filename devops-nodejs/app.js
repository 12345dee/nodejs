const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'dev';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from DevOps Node App!',
    environment: APP_ENV,
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Health check — Kubernetes liveness probe will call this
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: APP_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Readiness probe — Kubernetes readiness probe will call this
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    environment: APP_ENV
  });
});

// Version info
app.get('/version', (req, res) => {
  res.json({
    version: APP_VERSION,
    environment: APP_ENV,
    nodeVersion: process.version
  });
});

app.listen(PORT, () => {
  console.log(`[${APP_ENV.toUpperCase()}] Server running on port ${PORT}`);
  console.log(`Version: ${APP_VERSION}`);
});

module.exports = app;
