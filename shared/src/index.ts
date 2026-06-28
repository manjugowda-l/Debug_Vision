/**
 * DebugVision Shared Types and Interfaces
 * 
 * Central repository for types used across extension and backend.
 * Milestone 1: Foundation types
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  timestamp?: string;
}

/**
 * Service status information
 */
export interface ServiceStatus {
  service: string;
  status: 'running' | 'stopped' | 'error';
  uptime?: number;
}

/**
 * Extension configuration
 */
export interface ExtensionConfig {
  name: string;
  version: string;
  enableLogging: boolean;
}

/**
 * Debug session information (prepared for future milestones)
 */
export interface DebugSessionInfo {
  id: string;
  name: string;
  timestamp: string;
}

/**
 * Common constants
 */
export const EXTENSION_NAME = 'DebugVision';
export const EXTENSION_VERSION = '0.1.0';
export const DEFAULT_LOG_LEVEL = 'info' as const;
