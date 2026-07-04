import * as vscode from "vscode";
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

  /**
   * Builds an explanation prompt for a single diagnostic.
   */
  public buildExplanationPrompt(
    diagnostic: vscode.Diagnostic
  ): string {
    const language =
      this.workspaceService.getLanguageId() ?? "Unknown";

    const code =
      this.workspaceService.getActiveFileContent() ?? "No code available.";

    return `
You are DebugVision AI.

You are explaining ONE compiler error.

Language:
${language}

Error:
${diagnostic.message}

Severity:
${vscode.DiagnosticSeverity[diagnostic.severity]}

Line:
${diagnostic.range.start.line + 1}

Column:
${diagnostic.range.start.character + 1}

Source Code:

${code}

Instructions:

- Explain this specific error only.
- Explain why it happened.
- Explain how to fix it.
- Keep the explanation beginner friendly.
- Return HTML only.
`;
  }

  /**
 * Builds a prompt for generating an AI code fix.
 */
public buildFixPrompt(
  diagnostic: vscode.Diagnostic
): string {

  const language =
    this.workspaceService.getLanguageId() ?? "Unknown";

  const code =
    this.workspaceService.getActiveFileContent() ??
    "No source code.";

  return `
You are DebugVision AI.

You are an expert ${language} developer.

Your job is to fix ONLY the compiler error below.

Programming Language:
${language}

Compiler Error:
${diagnostic.message}

Severity:
${vscode.DiagnosticSeverity[diagnostic.severity]}

Line:
${diagnostic.range.start.line + 1}

Column:
${diagnostic.range.start.character + 1}

Source Code:
${code}

IMPORTANT RULES:

1. NEVER change the programming language.
2. NEVER generate code in another language.
3. ONLY modify the code required to fix the compiler error.
4. Keep the rest of the code unchanged.
5. Do NOT add unnecessary improvements.
6. If you are less than 95% confident, do NOT invent a fix.

Return ONLY valid JSON in exactly this format:

{
  "canFix": true,
  "confidence": 98,
  "fixedCode": "<complete corrected source code>",
  "reason": ""
}

If you are NOT at least 95% confident, return:

{
  "canFix": false,
  "confidence": 40,
  "fixedCode": "",
  "reason": "Explain why you cannot confidently fix this error and suggest what the developer should check."
}

Return JSON only.

Do NOT use markdown.

Do NOT use \`\`\`.

Do NOT add any explanation outside the JSON.
`;
}
}