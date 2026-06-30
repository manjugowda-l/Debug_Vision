import * as vscode from "vscode";
import { LoggerService } from "./LoggerService";
import { DiagnosticsCacheService } from "./DiagnosticsCacheService";

export class DiagnosticsService {
  private static instance: DiagnosticsService;

  private readonly logger = LoggerService.getInstance();
  private readonly cache = DiagnosticsCacheService.getInstance();

  // Stores the document being debugged
  private currentDocumentUri?: vscode.Uri;

  private constructor() {}

  public static getInstance(): DiagnosticsService {
    if (!DiagnosticsService.instance) {
      DiagnosticsService.instance = new DiagnosticsService();
    }

    return DiagnosticsService.instance;
  }

  /**
   * Sets the document currently being debugged.
   */
  public setCurrentDocument(uri: vscode.Uri): void {
    this.currentDocumentUri = uri;
  }

  /**
   * Returns diagnostics for the current debug document.
   */
  public getDiagnostics(): vscode.Diagnostic[] {
    if (!this.currentDocumentUri) {
      return [];
    }

    return vscode.languages.getDiagnostics(this.currentDocumentUri);
  }

  /**
   * Returns only errors.
   */
  public getErrors(): vscode.Diagnostic[] {
    return this.getDiagnostics().filter(
      diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Error
    );
  }

  /**
   * Returns only warnings.
   */
  public getWarnings(): vscode.Diagnostic[] {
    return this.getDiagnostics().filter(
      diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Warning
    );
  }

  /**
   * Returns only information diagnostics.
   */
  public getInformation(): vscode.Diagnostic[] {
    return this.getDiagnostics().filter(
      diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Information
    );
  }

  /**
   * Returns only hints.
   */
  public getHints(): vscode.Diagnostic[] {
    return this.getDiagnostics().filter(
      diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Hint
    );
  }

  /**
   * Returns total diagnostics.
   */
  public getDiagnosticCount(): number {
    return this.getDiagnostics().length;
  }

  /**
   * Logs new and resolved diagnostics.
   */
  public logDiagnostics(): void {
    const { newDiagnostics, resolvedDiagnostics } =
      this.cache.getNewDiagnostics(this.getDiagnostics());

    if (
      newDiagnostics.length === 0 &&
      resolvedDiagnostics.length === 0
    ) {
      return;
    }

    // Resolved diagnostics
    if (resolvedDiagnostics.length > 0) {
      this.logger.separator();
      this.logger.info(
        `✅ Resolved Diagnostics : ${resolvedDiagnostics.length}`
      );
    }

    // New diagnostics
    if (newDiagnostics.length > 0) {
      this.logger.separator();
      this.logger.info("🆕 New DebugVision Diagnostics");
      this.logger.info(`New Diagnostics : ${newDiagnostics.length}`);

      newDiagnostics.forEach((diagnostic, index) => {
        this.logger.separator();

        this.logger.info(`Diagnostic ${index + 1}`);
        this.logger.info(
          `Severity : ${vscode.DiagnosticSeverity[diagnostic.severity]}`
        );
        this.logger.info(`Message  : ${diagnostic.message}`);
        this.logger.info(
          `Line     : ${diagnostic.range.start.line + 1}`
        );
        this.logger.info(
          `Column   : ${diagnostic.range.start.character + 1}`
        );

        if (diagnostic.source) {
          this.logger.info(`Source   : ${diagnostic.source}`);
        }

        if (diagnostic.code) {
          this.logger.info(`Code     : ${diagnostic.code}`);
        }
      });

      this.logger.separator();
    }
  }
}