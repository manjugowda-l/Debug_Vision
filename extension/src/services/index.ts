/**
 * Central service registry for DebugVision.
 */

import { WorkspaceService } from "./WorkspaceService";
import { DiagnosticsService } from "./DiagnosticsService";
import { LoggerService } from "./LoggerService";

export class ExtensionService {
  private static instance: ExtensionService;

  private readonly workspaceService: WorkspaceService;
  private readonly diagnosticsService: DiagnosticsService;
  private readonly loggerService: LoggerService;

  private constructor() {
    this.workspaceService = WorkspaceService.getInstance();
    this.diagnosticsService = DiagnosticsService.getInstance();
    this.loggerService = LoggerService.getInstance();
  }

  public static getInstance(): ExtensionService {
    if (!ExtensionService.instance) {
      ExtensionService.instance = new ExtensionService();
    }

    return ExtensionService.instance;
  }

  public initialize(): void {
    this.loggerService.show();

    this.loggerService.separator();
    this.loggerService.info("DebugVision initialized");
    this.loggerService.separator();

    this.workspaceService.logWorkspaceInfo();
    this.diagnosticsService.logDiagnostics();
  }

  public getWorkspaceService(): WorkspaceService {
    return this.workspaceService;
  }

  public getDiagnosticsService(): DiagnosticsService {
    return this.diagnosticsService;
  }

  public getLoggerService(): LoggerService {
    return this.loggerService;
  }
}