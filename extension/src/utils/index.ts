/**
 * Extension utilities
 */

export const createMessageWithTimestamp = (message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}`;
};

export const logToConsole = (message: string): void => {
  console.log(message);
};
