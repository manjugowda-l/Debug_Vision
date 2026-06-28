/**
 * Backend type definitions
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}
