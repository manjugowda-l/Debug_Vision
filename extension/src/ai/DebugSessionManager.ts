import { LoggerService } from "../services/LoggerService";

/**
 * Manages the lifecycle of a DebugVision AI Debug Session.
 */
export class DebugSessionManager {
  private static instance: DebugSessionManager;

  private readonly logger = LoggerService.getInstance();

  private active = false;

  private constructor() {}

  public static getInstance(): DebugSessionManager {
    if (!DebugSessionManager.instance) {
      DebugSessionManager.instance = new DebugSessionManager();
    }

    return DebugSessionManager.instance;
  }

  /**
   * Starts a new debug session.
   */
  public startSession(): void {
    if (this.active) {
      return;
    }

    this.active = true;

    this.logger.separator();
    this.logger.info("AI Debug Session Started");
    this.logger.separator();
  }

  /**
   * Ends the current debug session.
   */
  public endSession(): void {
    if (!this.active) {
      return;
    }

    this.active = false;

    this.logger.separator();
    this.logger.info("AI Debug Session Ended");
    this.logger.separator();
  }

  /**
   * Returns whether a debug session is active.
   */
  public isSessionActive(): boolean {
    return this.active;
  }
}