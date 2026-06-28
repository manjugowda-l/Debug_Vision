/**
 * Server configuration
 */

import { ServerConfig } from '../types';

export const getConfig = (): ServerConfig => {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  };
};
