import * as vscode from "vscode";
import { DiagnosticsService } from "../services/DiagnosticsService";

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

            <button disabled>Explain</button>
            <button disabled>Apply Fix</button>

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

</body>

</html>
`;
  }
}