import * as vscode from "vscode";
import { DiagnosticsService } from "../services/DiagnosticsService";
import { AIService } from "../ai";
import { WorkspaceService } from "../services/WorkspaceService";

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
            WorkspaceService
                .getInstance()
                .getActiveFileContent() ?? "";
                    

         console.log("CURRENT:", currentCode);

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
// Chat
// ==========================
if (message.command === "chat") {

  const diagnostics = this.diagnosticsService.getDiagnostics();
  const diagnostic = diagnostics[message.index];

  if (!diagnostic) {
    return;
  }

  this.panel.webview.postMessage({
    command: "chatLoading",
    index: message.index
  });

  try {

    const response =
      await AIService.getInstance().chatAboutDiagnostic(
        diagnostic,
        message.question
      );

    this.panel.webview.postMessage({
      command: "chatResponse",
      index: message.index,
      response
    });

  } catch (error) {

    vscode.window.showErrorMessage(
      error instanceof Error
        ? error.message
        : "Failed to generate chat response."
    );

  }

  return;
}


if (message.command === "confirmFix") {

    const editor =
    WorkspaceService
        .getInstance()
        .getStoredEditor();

    if (!editor) {
        return;
    }

    await editor.edit(editBuilder => {

        editBuilder.replace(

            new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(
                    editor.document.getText().length
                )
            ),

            message.fixedCode

        );

    });

    vscode.window.showInformationMessage(
        "✅ AI fix applied successfully."
    );

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

            
            <button class="apply-fix-btn" data-index="${index}">
                Apply Fix
            </button>

            <button
                  class="chat-btn"
                  data-index="${index}">
                  💬 Chat about this error
              </button>

              <div
                id="content-${index}"
                class="content-panel"
                style="display:none;margin-top:15px;">
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
    padding:8px 18px;
    margin-top:12px;
    margin-right:10px;

    border:none;
    border-radius:6px;

    cursor:pointer;

    font-size:14px;
    font-weight:600;

    transition:0.2s;
}


.explain-btn{
    background:#007ACC;
    color:white;
}

.explain-btn:hover{
    background:#0E639C;
}

.apply-fix-btn{
    background:#2EA043;
    color:white;
}

.apply-fix-btn:hover{
    background:#238636;
}

.chat-btn{
    background:#7C3AED;
    color:white;
}

.chat-btn:hover{
    background:#6D28D9;
}


button.active-btn{
    outline:2px solid white;
    transform:scale(1.03);
    box-shadow:0 0 10px rgba(255,255,255,0.15);
}

.empty{
    text-align:center;
    margin-top:50px;
}

.content-panel{
    margin-top:18px;
    padding:20px;

    background:#252526;

    border-radius:10px;

    border:1px solid #3C3C3C;

    animation:fadeIn .2s ease-in-out;
}

.content-panel.hidden{
    display:none !important;
}


@keyframes fadeIn{

from{
    opacity:0;
    transform:translateY(8px);
}

to{
    opacity:1;
    transform:translateY(0);
}

}
pre{
    background:#1E1E1E;
    border-left:4px solid #007ACC;
    border-radius:8px;
    padding:14px;
    overflow:auto;
    white-space:pre-wrap;
    font-family:Consolas,"Courier New",monospace;
    font-size:13px;
    line-height:1.6;
    margin-top:10px;
    margin-bottom:16px;
}

code{
    color:#DCDCAA;
}

.code-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:12px;
    margin-bottom:8px;
}

.copy-code-btn{
    background:#3C3C3C;
    color:white;
    border:none;
    border-radius:6px;
    padding:5px 10px;
    cursor:pointer;
    font-size:12px;
}

.copy-code-btn:hover{
    background:#4A4A4A;
}

</style>

</head>

<body>

<h2>🐞 DebugVision</h2>

${diagnosticsHtml}
<script>

const vscode = acquireVsCodeApi();
function setActiveButton(button){

    document
        .querySelectorAll(
            ".explain-btn,.apply-fix-btn,.chat-btn"
        )
        .forEach(btn =>
            btn.classList.remove("active-btn")
        );

    button.classList.add("active-btn");
}
document.addEventListener("click", (event) => {

    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }


    const copyBtn = target.closest(".copy-code-btn");

if (copyBtn) {

    const code =
        decodeURIComponent(copyBtn.dataset.code);

    navigator.clipboard.writeText(code);

    copyBtn.textContent = "✅ Copied";

    setTimeout(() => {
        copyBtn.textContent = "📋 Copy";
    }, 1500);

    return;
}

const confirmBtn = target.closest(".confirm-fix-btn");

if (confirmBtn) {

console.log("Confirm Fix button clicked");
    console.log(confirmBtn.dataset.code);
    vscode.postMessage({
      
        command: "confirmFix",

        fixedCode: decodeURIComponent(
            confirmBtn.dataset.code
        )

    });

    return;
}

const cancelBtn = target.closest(".cancel-fix-btn");

if (cancelBtn) {

    const content =
        cancelBtn.closest(".content-panel");

    if (content) {
        content.innerHTML = "";
        content.style.display = "none";
    }

    document
        .querySelectorAll(
            ".explain-btn,.apply-fix-btn,.chat-btn"
        )
        .forEach(btn =>
            btn.classList.remove("active-btn")
        );

    return;
}


    const explainBtn = target.closest(".explain-btn");

if (explainBtn) {
    setActiveButton(explainBtn);
   
    vscode.postMessage({
        command: "explain",
        index: Number(explainBtn.dataset.index)
    });
    return;
}

const applyFixBtn = target.closest(".apply-fix-btn");

if (applyFixBtn) {
    setActiveButton(applyFixBtn);
   
    vscode.postMessage({
        command: "applyFix",
        index: Number(applyFixBtn.dataset.index)
    });
    return;
}

const chatBtn = target.closest(".chat-btn");

if (chatBtn) {
setActiveButton(chatBtn);

    const index = chatBtn.dataset.index;

    const content =
        document.getElementById("content-" + index);

    if (!content) {
        return;
    }

    content.style.display = "block";

    content.innerHTML = \`
        <textarea
            id="question-\${index}"
            rows="4"
            style="
                width:100%;
                margin-top:10px;
                padding:8px;
            "
            placeholder="Ask anything about this error..."></textarea>

        <br><br>

        <button
            class="send-chat-btn"
            data-index="\${index}">
            Send
        </button>
    \`;

    return;
}

const sendChatBtn = target.closest(".send-chat-btn");

if (sendChatBtn) {

    const index = sendChatBtn.dataset.index;

    const input =
        document.getElementById(
            "question-" + index
        );

    if (!input) {
        return;
    }
    const chat =
    document.getElementById("content-" + message.index)


    if (chat) {

        chat.innerHTML += \`
            <hr>

            <b>You:</b>

            <div style="
                margin-top:8px;
                margin-bottom:12px;
            ">
                \${input.value}
            </div>
        \`;
    }
    vscode.postMessage({
        command: "chat",
        index: Number(index),
        question: input.value
    });
    input.value = "";
    return;
}

const closeExplanationBtn =
    target.closest(".close-explanation-btn");

if (closeExplanationBtn) {

    const panel =
        closeExplanationBtn.closest(".content-panel");

    if (panel) {
        panel.innerHTML = "";
        panel.style.display = "none";
    }



    document
        .querySelectorAll(".explain-btn")
        .forEach(btn =>
            btn.classList.remove("active-btn")
        );

    return;
}


});

window.addEventListener("message", (event) => {

    const message = event.data;

    if (message.command === "loading") {

        const div =
            document.getElementById("content-" + message.index)

        if (!div) {
            return;
        }

        div.style.display = "block";
        div.innerHTML = \`
            <div style="
                padding:16px;
                background:#252526;
                border-radius:8px;
                color:#4FC3F7;
                font-weight:600;
            ">
            🤖 DebugVision AI is analyzing your code...
            </div>
           \`;
    }

   if (message.command === "showExplanation") {

    const div =
        document.getElementById("content-" + message.index);

    if (!div) {
        return;
    }

    div.style.display = "block";
    div.innerHTML = \`
\${message.explanation}



<div style="
    display:flex;
    justify-content:flex-end;
    margin-top:20px;
">

    <button
        class="close-explanation-btn"
        style="
            background:none;
            border:none;
            color:#9CDCFE;
            cursor:pointer;
            font-size:14px;
        ">
        ✕ Close
    </button>

</div>
\`;

const example = div.querySelector(".example-code");

if (example) {

    example.insertAdjacentHTML(
        "beforebegin",
        \`
        <div class="code-header">
            <span>Correct Example</span>

            <button
                class="copy-code-btn"
                data-code="\${encodeURIComponent(example.textContent ?? "")}">
                📋 Copy
            </button>
        </div>
        \`
    );

}
}


    if (message.command === "loadingFix") {

    const div =
        document.getElementById("content-" + message.index)

    if (!div) {
        return;
    }

    div.style.display = "block";
    div.innerHTML = "<i>Generating AI Fix...</i>";
}

if (message.command === "showFixPreview") {

    const div =
        document.getElementById("content-" + message.index)

    if (!div) {
        return;
    }

    div.style.display = "block";

    div.innerHTML = \`
        <h3 style="color:#4FC3F7;">📄 Current Code</h3><h4>Current Code</h4>

        <pre><code>\${message.currentCode}</code></pre>

        <h3 style="color:#81C784;">✨ AI Suggested Fix</h3>

        <div class="code-header">

    <span>Suggested Fix</span>

    <button
        class="copy-code-btn"
        data-code="\${encodeURIComponent(message.fixedCode)}">
        📋 Copy
    </button>

</div>

<pre><code>\${message.fixedCode}</code></pre>

        <div style="
            margin:16px 0;
            padding:10px;
            background:#2d2d30;
            border-radius:8px;
        ">
            🎯 <b>AI Confidence:</b>
            <span style="color:#81C784;">
                \${message.confidence}%
            </span>
        </div>

        <div style="margin-top:18px;display:flex;gap:12px;">

    <button
    class="confirm-fix-btn"
    data-code="\${encodeURIComponent(message.fixedCode)}">
    ✅ Apply Fix
</button>

    <button class="cancel-fix-btn">
        ❌ Cancel
    </button>

</div>
    \`;
}

if (message.command === "showCannotFix") {

    const div =
        document.getElementById("content-" + message.index)

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


if (message.command === "chatLoading") {

    const chat =
        document.getElementById("content-" + message.index);

    if (!chat) {
        return;
    }

    chat.style.display = "block";

    chat.innerHTML = "<i>AI is thinking...</i>";
}



if (message.command === "chatResponse") {

    const chat =
        document.getElementById("content-" + message.index)

    if (!chat) {
        return;
    }

    chat.innerHTML += \`
        <hr>

        <b>AI:</b>

        <div style="
            margin-top:8px;
            white-space:pre-wrap;
        ">
            \${message.response}
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