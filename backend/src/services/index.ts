/**
 * Backend services
 */

import { HealthCheckResponse } from '../types';
import { getTimestamp } from '../utils';

export class HealthService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  public getHealthStatus(): HealthCheckResponse {
    return {
      status: 'running',
      service: 'DebugVision Backend',
      timestamp: getTimestamp(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
