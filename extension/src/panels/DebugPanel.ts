import * as vscode from "vscode";
import { DiagnosticsService } from "../services/DiagnosticsService";
import { AIService } from "../ai";
export class DebugPanel {
  private static currentPanel: DebugPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly diagnosticsService = DiagnosticsService.getInstance();
  private diagnosticsListener?: vscode.Disposable;

  private constructor() {
    this.panel = vscode.window.createWebviewPanel(
      "debugvision",
      "🐞 DebugVision",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    this.refresh();
    this.registerMessageHandler();
    // Listen for diagnostics changes
    this.diagnosticsListener = vscode.languages.onDidChangeDiagnostics(() => {
      this.refresh();
    });

    this.panel.onDidDispose(() => {
      this.diagnosticsListener?.dispose();
      DebugPanel.currentPanel = undefined;
    });
  }

  public static createOrShow(): DebugPanel {
    if (DebugPanel.currentPanel) {
      DebugPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
      return DebugPanel.currentPanel;
    }

    DebugPanel.currentPanel = new DebugPanel();
    return DebugPanel.currentPanel;
  }


  private registerMessageHandler(): void {
  this.panel.webview.onDidReceiveMessage(async (message) => {

    // ==========================
    // Apply Fix
    // ==========================
    if (message.command === "applyFix") {

      const diagnostics = this.diagnosticsService.getDiagnostics();
      const diagnostic = diagnostics[message.index];

      if (!diagnostic) {
        return;
      }

      this.panel.webview.postMessage({
        command: "loadingFix",
        index: message.index
      });

      try {

        const fixResponse = await AIService.getInstance().generateFix(diagnostic) as import("../ai/AIService").FixResponse;if (!fixResponse.canFix) {

            this.panel.webview.postMessage({
              command: "showCannotFix",
              index: message.index,
              reason: fixResponse.reason
            });

            return;
          }

          const currentCode =
            vscode.window.activeTextEditor?.document.getText() ?? "";

          this.panel.webview.postMessage({
            command: "showFixPreview",
            index: message.index,
            currentCode,
            fixedCode: fixResponse.fixedCode,
            confidence: fixResponse.confidence
          });

      } catch (error) {

        vscode.window.showErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to generate AI fix."
        );

      }

      return;
    }

    // ==========================
    // Explain
    // ==========================
    if (message.command === "explain") {

      const diagnostics = this.diagnosticsService.getDiagnostics();
      const diagnostic = diagnostics[message.index];

      if (!diagnostic) {
        return;
      }

      this.panel.webview.postMessage({
        command: "loading",
        index: message.index
      });

      try {

        const explanation = (
          await AIService.getInstance().explainDiagnostic(diagnostic)
        )
          .replace(/^```html\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```$/i, "")
          .trim();

        this.panel.webview.postMessage({
          command: "showExplanation",
          index: message.index,
          explanation
        });

      } catch (error) {

        vscode.window.showErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to generate explanation."
        );

      }

      return;
    }

  });
}
  /**
   * Refreshes the panel whenever diagnostics change.
   */
  public refresh(): void {
    const diagnostics = this.diagnosticsService.getDiagnostics();

    console.log("REFRESH:", diagnostics.length);

    this.panel.webview.html = this.getHtml(diagnostics);
}

  private getHtml(diagnostics: vscode.Diagnostic[]): string {
    const diagnosticsHtml =
      diagnostics.length === 0
        ? `
        <div class="empty">
          <h3>🎉 No diagnostics found</h3>
          <p>Your code looks clean.</p>
        </div>
      `
        : `
        <h3>Found ${diagnostics.length} Diagnostic(s)</h3>

        ${diagnostics
          .map(
            (diagnostic, index) => `
          <div class="card">

            <h4>❌ Error ${index + 1}</h4>

            <p><b>Message:</b><br>${diagnostic.message}</p>

            <p><b>Line:</b> ${diagnostic.range.start.line + 1}</p>

            <button class="explain-btn" data-index="${index}">
                Explain
            </button>

            <div
                id="explanation-${index}"
                style="
                    display:none;
                    margin-top:12px;
                    background:#1b1b1b;
                    padding:12px;
                    border-radius:8px;
                ">
            </div>
            <button class="apply-fix-btn" data-index="${index}">
                Apply Fix
            </button>

            <div
                id="fix-preview-${index}"
                style="
                    display:none;
                    margin-top:15px;
                    background:#1b1b1b;
                    border-radius:8px;
                    padding:15px;
                ">
            </div>

          </div>
        `
          )
          .join("")}
      `;

    return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body{
    font-family:Segoe UI;
    background:#1e1e1e;
    color:white;
    padding:20px;
}

.card{
    background:#2d2d30;
    border-radius:10px;
    padding:16px;
    margin-top:15px;
}

button{
    margin-right:10px;
    margin-top:10px;
    padding:8px 14px;
}

.empty{
    text-align:center;
    margin-top:50px;
}

</style>

</head>

<body>

<h2>🐞 DebugVision</h2>

${diagnosticsHtml}
<script>

const vscode = acquireVsCodeApi();

document.addEventListener("click", (event) => {

    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const explainBtn = target.closest(".explain-btn");

if (explainBtn) {
    vscode.postMessage({
        command: "explain",
        index: Number(explainBtn.dataset.index)
    });
    return;
}

const applyFixBtn = target.closest(".apply-fix-btn");

if (applyFixBtn) {
    vscode.postMessage({
        command: "applyFix",
        index: Number(applyFixBtn.dataset.index)
    });
    return;
}

});

window.addEventListener("message", (event) => {

    const message = event.data;

    if (message.command === "loading") {

        const div =
            document.getElementById(
                "explanation-" + message.index
            );

        if (!div) {
            return;
        }

        div.style.display = "block";
        div.innerHTML = "<i>Generating explanation...</i>";

    }

    if (message.command === "showExplanation") {

        const div =
            document.getElementById(
                "explanation-" + message.index
            );

        if (!div) {
            return;
        }

        div.style.display = "block";
        div.innerHTML = message.explanation;

    }


    if (message.command === "loadingFix") {

    const div =
        document.getElementById(
            "fix-preview-" + message.index
        );

    if (!div) {
        return;
    }

    div.style.display = "block";
    div.innerHTML = "<i>Generating AI Fix...</i>";
}

if (message.command === "showFixPreview") {

    const div =
        document.getElementById(
            "fix-preview-" + message.index
        );

    if (!div) {
        return;
    }

    div.style.display = "block";

    div.innerHTML = \`
        <h4>Current Code</h4>

        <pre style="
            white-space:pre-wrap;
            background:#111;
            padding:10px;
            border-radius:6px;
            overflow:auto;
        ">\${message.currentCode}</pre>

        <h4>Suggested Fix</h4>

        <pre style="
            white-space:pre-wrap;
            background:#111;
            padding:10px;
            border-radius:6px;
            overflow:auto;
        ">\${message.fixedCode}</pre>

        <p><b>Confidence:</b> \${message.confidence}%</p>

        <button class="confirm-fix-btn">
            Apply
        </button>

        <button class="cancel-fix-btn">
            Cancel
        </button>
    \`;
}

if (message.command === "showCannotFix") {

    const div =
        document.getElementById(
            "fix-preview-" + message.index
        );

    if (!div) {
        return;
    }

    div.style.display = "block";

    div.innerHTML = \`
        <div style="color:#ffcc00;">
            <h4>⚠ AI is not confident enough to apply a fix.</h4>

            <p><b>Reason:</b></p>

            <p>\${message.reason}</p>
        </div>
    \`;
}

});

</script>
</body>

</html>
`;
  }
}