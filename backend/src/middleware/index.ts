/**
 * Backend middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logMessage } from '../utils';

export const loggingMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logMessage('info', `${req.method} ${req.path}`);
  next();
};

export const errorHandlingMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logMessage('error', `${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
