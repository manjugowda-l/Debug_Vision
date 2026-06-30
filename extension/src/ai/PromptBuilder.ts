import { WorkspaceService } from "../services/WorkspaceService";
import { DiagnosticsService } from "../services/DiagnosticsService";

/**
 * Builds prompts for AI providers.
 */
export class PromptBuilder {
  private readonly workspaceService = WorkspaceService.getInstance();
  private readonly diagnosticsService = DiagnosticsService.getInstance();

  /**
   * Builds a debugging prompt using the current editor state.
   */
  public buildDebugPrompt(): string {
    const workspaceName =
      this.workspaceService.getWorkspaceName() ?? "Unknown";

    const fileName =
      this.workspaceService.getActiveFileName() ?? "Unknown";

    const language =
      this.workspaceService.getLanguageId() ?? "Unknown";

    const code =
      this.workspaceService.getActiveFileContent() ?? "No code available.";

    const diagnostics = this.diagnosticsService
      .getDiagnostics()
      .map((diagnostic, index) => {
        return `${index + 1}. ${diagnostic.message}
Severity: ${diagnostic.severity}
Line: ${diagnostic.range.start.line + 1}
Column: ${diagnostic.range.start.character + 1}`;
      })
      .join("\n\n");

    return `
You are DebugVision AI.

Analyze the following source code and diagnostics.

Workspace:
${workspaceName}

File:
${fileName}

Language:
${language}

Diagnostics:
${diagnostics || "No diagnostics found."}

Source Code:
${code}

Your task:
1. Explain the errors in simple English.
2. Explain why they happened.
3. Suggest the best fix.
4. Mention best practices if applicable.
`;
  }
}