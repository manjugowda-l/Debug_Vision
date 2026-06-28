/**
 * API Controllers
 */

import { Request, Response } from 'express';
import { HealthService } from '../services';

const healthService = new HealthService();

export const getHealthStatus = (_req: Request, res: Response): void => {
  const health = healthService.getHealthStatus();
  res.json(health);
};
