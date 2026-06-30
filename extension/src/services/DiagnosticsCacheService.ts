import * as vscode from "vscode";

export class DiagnosticsCacheService {
  private static instance: DiagnosticsCacheService;

  private previousDiagnostics = new Set<string>();

  private constructor() {}

  public static getInstance(): DiagnosticsCacheService {
    if (!DiagnosticsCacheService.instance) {
      DiagnosticsCacheService.instance = new DiagnosticsCacheService();
    }

    return DiagnosticsCacheService.instance;
  }

  /**
   * Returns only diagnostics that are new.
   */
  public getNewDiagnostics(
  diagnostics: vscode.Diagnostic[]
): {
  newDiagnostics: vscode.Diagnostic[];
  resolvedDiagnostics: string[];
} {
  const currentKeys = new Set<string>();

  const newDiagnostics: vscode.Diagnostic[] = [];
  const resolvedDiagnostics: string[] = [];

  for (const diagnostic of diagnostics) {
    const key = this.createKey(diagnostic);

    currentKeys.add(key);

    if (!this.previousDiagnostics.has(key)) {
      newDiagnostics.push(diagnostic);
    }
  }

  for (const key of this.previousDiagnostics) {
    if (!currentKeys.has(key)) {
      resolvedDiagnostics.push(key);
    }
  }

  this.previousDiagnostics = currentKeys;

  return {
    newDiagnostics,
    resolvedDiagnostics
  };
}

  /**
   * Clears all cached diagnostics.
   */
  public clear(): void {
    this.previousDiagnostics.clear();
  }

  private createKey(diagnostic: vscode.Diagnostic): string {
  return [
    diagnostic.code ?? "",
    diagnostic.message,
    diagnostic.severity,
    diagnostic.source ?? ""
  ].join("|");
}
}