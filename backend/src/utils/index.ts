/**
 * Backend utilities
 */

export const getTimestamp = (): string => {
  return new Date().toISOString();
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const logMessage = (level: 'info' | 'warn' | 'error', message: string): void => {
  const timestamp = getTimestamp();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
};
