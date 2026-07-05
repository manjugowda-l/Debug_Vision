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

You are an expert ${language} developer and an excellent programming mentor.

Your job is to explain compiler errors to beginners in a clear, friendly, and professional way.

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

Complete Source Code:

${code}

Instructions:

Use the following structure exactly.

<h3>📘 Explanation</h3>

Explain what the compiler is complaining about in simple English.

<h3>❓ Why it happened</h3>

Explain why THIS code produced this error.
Refer to the actual source code above.

<h3>🛠 How to fix it</h3>

Explain the correct approach.

<h3>💡 Correct Example</h3>

Provide only the corrected code snippet.

Return it exactly in this format:

<div class="code-header">
    <span>Correct Example</span>
</div>

<div class="example-code">
<pre><code>
...
</code></pre>
</div>



<h3>⭐ Best Practice</h3>

Give one professional programming tip.

Rules:

- Use simple English.
- Never mention that you are an AI.
- Never say "I don't have the source code."
- Never use markdown code fences.
- Never output HTML comments.
- Never output placeholders.
- Keep the explanation under 250 words.

Never output placeholders.

Never output HTML comments.
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
2. NEVER modify unrelated code.
3. Fix ONLY the compiler error shown above.
4. Preserve formatting, comments and indentation whenever possible.
5. Return the ENTIRE corrected source file.
6. Do NOT remove working code.
7. Do NOT add extra features or refactor the code.
8. If multiple fixes are possible, choose the safest and smallest change.
9. If you are less than 95% confident, DO NOT guess.
10. The corrected code MUST compile if the compiler error is fixed.
Return ONLY valid JSON.

Do not wrap the JSON inside markdown.

Do not write any explanation outside the JSON.

Use exactly this schema:
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

public buildChatPrompt(
  diagnostic: vscode.Diagnostic,
  question: string
): string {

  const language =
    this.workspaceService.getLanguageId() ?? "Unknown";

  const code =
    this.workspaceService.getActiveFileContent() ??
    "No source code.";

  return `
You are DebugVision AI.

You are an expert ${language} developer and programming mentor.

You are helping a developer understand a compiler error.

Programming Language:
${language}

Compiler Error:
${diagnostic.message}

Line:
${diagnostic.range.start.line + 1}

Source Code:

${code}

Developer Question:
${question}

Instructions:

1. Always answer using the source code above.
2. Never say "No source code was provided."
3. Explain concepts in simple English.
4. If the question is about a keyword (const, let, var, class, interface, etc.), explain it using THIS source code.
5. If the compiler error is related to the question, explain the relationship.
6. If appropriate, show a corrected example using the SAME programming language.
7. Never change the programming language.
8. Do not rewrite the entire program unless asked.
9. Do not use markdown code fences.
10. Keep the answer concise and beginner-friendly.
`;
}

}