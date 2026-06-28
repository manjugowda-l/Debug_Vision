/**
 * DebugVision Backend Server
 * 
 * Milestone 1: Foundation
 * - Express.js HTTP Server
 * - Basic health check endpoint
 * - TypeScript configuration
 */

import { createApp } from './app';
import { getConfig } from './config';
import { logMessage } from './utils';

const config = getConfig();
const app = createApp();

const server = app.listen(config.port, config.host, () => {
  logMessage('info', `Server started on http://${config.host}:${config.port}`);
  logMessage('info', `Environment: ${config.environment}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logMessage('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    logMessage('info', 'Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logMessage('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    logMessage('info', 'Server closed');
    process.exit(0);
  });
});
