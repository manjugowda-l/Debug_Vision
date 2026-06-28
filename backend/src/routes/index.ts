/**
 * API Routes
 */

import { Router } from 'express';
import { getHealthStatus } from '../controllers';

export const createRouter = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/', getHealthStatus);

  return router;
};
