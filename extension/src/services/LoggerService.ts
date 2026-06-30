import * as vscode from "vscode";

export class LoggerService {
  private static instance: LoggerService;

  private readonly outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel("DebugVision");
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }

    return LoggerService.instance;
  }

  /**
   * Shows the DebugVision output channel.
   */
  public show(): void {
    this.outputChannel.show(true);
  }

  /**
   * Clears all logs.
   */
  public clear(): void {
    this.outputChannel.clear();
  }

  /**
   * Logs an information message.
   */
  public info(message: string): void {
    this.outputChannel.appendLine(
      `[INFO ${new Date().toLocaleTimeString()}] ${message}`
    );
  }

  /**
   * Logs a warning message.
   */
  public warn(message: string): void {
    this.outputChannel.appendLine(
      `[WARN ${new Date().toLocaleTimeString()}] ${message}`
    );
  }

  /**
   * Logs an error message.
   */
  public error(message: string): void {
    this.outputChannel.appendLine(
      `[ERROR ${new Date().toLocaleTimeString()}] ${message}`
    );
  }

  /**
   * Logs a separator.
   */
  public separator(): void {
    this.outputChannel.appendLine(
      "------------------------------------------------------------"
    );
  }

  /**
   * Disposes the output channel.
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }
}