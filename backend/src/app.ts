/**
 * Express Application Setup
 */

import express, { Express } from 'express';
import { loggingMiddleware, errorHandlingMiddleware } from './middleware';
import { createRouter } from './routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggingMiddleware);

  // Routes
  app.use(createRouter());

  // Error handling
  app.use(errorHandlingMiddleware);

  return app;
};
