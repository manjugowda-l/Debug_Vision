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



if (message.command === "globalChat") {

    this.panel.webview.postMessage({
        command: "globalChatLoading"
    });

    try {

        const diagnostics =
            this.diagnosticsService.getDiagnostics();

        const response =
            await AIService.getInstance().chatAboutWorkspace(
                diagnostics,
                message.question
            );

        this.panel.webview.postMessage({
            command: "globalChatResponse",
            response
        });

    } catch (error) {

        vscode.window.showErrorMessage(
            error instanceof Error
                ? error.message
                : "Failed to generate AI response."
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


      const styles = `
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


    .typing-dots{
    display:flex;
    gap:6px;
    align-items:center;
}

.typing-dots span{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#4FC3F7;
    animation:typingBounce 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2){
    animation-delay:.2s;
}

.typing-dots span:nth-child(3){
    animation-delay:.4s;
}

@keyframes typingBounce{

    0%,80%,100%{
        transform:scale(.6);
        opacity:.5;
    }

    40%{
        transform:scale(1);
        opacity:1;
    }

}

.chat-history-card{
    transition:all .2s ease;
}

.chat-history-card:hover{

    transform:translateY(-2px);

    filter:brightness(1.08);

    box-shadow:0 6px 16px rgba(0,0,0,.35);

}

    </style>
    `;
//      const headerHtml = `
//          <div style="
//    display:flex;
//    justify-content:space-between;
//    align-items:center;
//    margin-bottom:20px;
//">
  

//   <div
//    id="header-left"
//    style="
//        display:flex;
//        align-items:center;
//    ">
//</div>
//    <button
//        id="toggle-ai-btn"
//        style="
//            background:#6C3CF0;
//            color:white;
//            border:none;
//            padding:8px 16px;
//            border-radius:8px;
//            cursor:pointer;
//            font-weight:bold;
//        ">

//        🤖 Ask AI

//    </button>

//</div>



//      `;
      const diagnosticsPage = `
<div id="diagnostics-page">

    ${diagnosticsHtml}

</div>
`;

    const diagnosticsHeader = `
<div
id="diagnostics-header"
style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
">

    <h1 style="margin:0;">
        🐞 DebugVision
    </h1>

    <button
        id="toggle-ai-btn"
        style="
            background:#6C3CF0;
            color:white;
            border:none;
            padding:8px 16px;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
        ">

        🤖 Ask AI

    </button>

</div>
`;

const chatHeader = `
<div
id="chat-header"
style="display:none;
    
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
">

    <div style="
        display:flex;
        align-items:center;
        gap:12px;
    ">

        <button
            id="menu-btn"
            style="
                background:none;
                border:none;
                color:white;
                font-size:22px;
                cursor:pointer;
            ">
            ☰
        </button>

        <h1 style="margin:0;">
            🐞 DebugVision
        </h1>

    </div>

    <button
        id="back-btn"
        style="
            background:#6C3CF0;
            color:white;
            border:none;
            padding:8px 16px;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
        ">

        ← Back

    </button>

</div>
`;


      const chatPage = `
      <div id="chat-page" style="display:none;">

      <div
    id="chat-sidebar"
    style="
        position:fixed;
        top:0;
        left:-260px;
        width:250px;
        height:100%;
        background:#252526;
        border-right:1px solid #3C3C3C;
        transition:left .25s ease;
        z-index:999;
        padding:20px;
        box-sizing:border-box;
    ">

   <div style="
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:20px;
">

    <button
        id="close-sidebar-btn"
        style="
            background:none;
            border:none;
            color:white;
            font-size:18px;
            cursor:pointer;
        ">
        ←
    </button>

    <h3 style="margin:0;">
        Chats
    </h3>

</div>
    <button
        id="new-chat-btn"
        style="
            width:100%;
            margin-top:20px;
            padding:10px;
            background:#6C3CF0;
            color:white;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
        ">
        ➕ New Chat
    </button>

    <hr style="margin:18px 0;border-color:#444;">

<div
    style="
        color:#BBBBBB;
        font-size:13px;
        margin-bottom:10px;
    ">
    Today
</div>

<div id="chat-history-list"></div>

</div>
    
<hr style="margin:30px 0;border-color:#444;">

<div id="global-chat">


<div style="
    display:flex;
    flex-direction:column;
    height:calc(100vh - 180px);
">

    <div
    id="chat-history"
    style="
        flex:1;
        overflow-y:auto;
        background:#252526;
        border-radius:10px;
        padding:18px;
        margin-bottom:15px;
    ">

    <div id="chat-empty-state"
        style="
            text-align:center;
            margin-top:50px;
            color:#BBBBBB;
        ">

        <div style="
            font-size:42px;
            margin-bottom:12px;
        ">
            💬
        </div>

        <h3 style="
            color:#4FC3F7;
            margin-bottom:10px;
        ">
            Welcome to DebugVision AI
        </h3>

        <p style="line-height:1.8;">

            Ask me anything about:

            <br><br>

            📄 Your current file

            <br>

            ❌ Compiler errors

            <br>

            🧠 Programming concepts

            <br>

            🛠 AI fix suggestions

        </p>

        <p style="
            margin-top:25px;
            opacity:.7;
        ">
            Start by typing a question below.
        </p>

    </div>

</div>

    <div style="
        background:#252526;
    border:1px solid #3C3C3C;
    border-radius:12px;
    padding:12px;
    ">

        <textarea
    id="global-question"
    rows="2"
    style="
        width:100%;
        resize:none;
        padding:14px 16px;
        border:none;
        border-radius:12px;
        box-sizing:border-box;
        background:#252526;
        color:white;
        font-size:14px;
        font-family:Segoe UI;
        outline:none;
        line-height:1.5;
    "
    placeholder="Ask anything about your code..."></textarea>
        <div style="
            display:flex;
            justify-content:flex-end;
            margin-top:12px;
        ">

            <button id="global-send-btn">
    ➤ Send
</button>
        </div>

    </div>

</div>
</div>
</div>
        `;
        const scripts = `
        <script>
        const vscode = acquireVsCodeApi();
        let currentChat = null;

let chatHistory = [];
let activeChatId = null;
let isGenerating = false;
let stopRequested = false;
function createNewChat() {

    currentChat = {

        id: Date.now(),

        title: "",

        messages: []

    };
    activeChatId = currentChat.id;

}

createNewChat();

function getWelcomeScreen() {

    return \`
<div id="chat-empty-state"
    style="
        text-align:center;
        margin-top:50px;
        color:#BBBBBB;
    ">

    <div style="
        font-size:42px;
        margin-bottom:12px;
    ">
        💬
    </div>

    <h3 style="
        color:#4FC3F7;
        margin-bottom:10px;
    ">
        Welcome to DebugVision AI
    </h3>

    <p style="line-height:1.8;">

        Ask me anything about:

        <br><br>

        📄 Your current file

        <br>

        ❌ Compiler errors

        <br>

        🧠 Programming concepts

        <br>

        🛠 AI fix suggestions

    </p>

    <p style="
        margin-top:25px;
        opacity:.7;
    ">
        Start by typing a question below.
    </p>

</div>
\`;
}

function createUserMessage(text) {

    return \`
<div style="
    display:flex;
    justify-content:flex-end;
    margin:20px 0;
">

    <div style="
        max-width:80%;
        background:linear-gradient(135deg,#0E639C,#1177BB);
        color:white;
        padding:14px 16px;
        border-radius:18px 18px 6px 18px;
    ">

        <div style="
            white-space:pre-wrap;
            line-height:1.6;
        ">
            \${text}
        </div>

    </div>

</div>
\`;

}

function createAIMessage(text) {

    return \`
<div
    style="
        display:flex;
        justify-content:flex-start;
        margin:20px 0;
    ">

    <div style="
        max-width:80%;
        background:#2D2D30;
        border:1px solid #3E3E42;
        border-left:4px solid #4FC3F7;
        padding:16px;
        border-radius:18px 18px 18px 6px;
    ">

        <div style="
            color:#4FC3F7;
            font-size:12px;
            font-weight:bold;
            margin-bottom:10px;
        ">
            🤖 DEBUGVISION AI
        </div>

        <div style="
            white-space:pre-wrap;
            line-height:1.75;
        ">
            \${text}
        </div>

    </div>

</div>
\`;
}

function renderChatHistory() {

    const sidebar =
        document.getElementById("chat-history-list");

    if (!sidebar) {
        return;
    }

    sidebar.innerHTML = "";

    chatHistory
        .slice()
        .reverse()
        .forEach(chat => {
            const isActive = chat.id === activeChatId;
            sidebar.innerHTML += \`
                <div
                    class="history-item chat-history-card"
                    data-id="\${chat.id}"
                    style="
    padding:14px;
    margin-top:8px;
    border-radius:12px;
    cursor:pointer;
    box-shadow:0 2px 8px rgba(0,0,0,.25);
    transition:.2s;
    background:\${isActive ? "#6C3CF0" : "#2D2D30"};
    border:\${isActive ? "1px solid #A78BFA" : "1px solid transparent"};
">

                    <div style="
    display:flex;
    align-items:center;
    gap:8px;
    font-weight:600;
    color:white;
">
    💬
    <span>
       \${chat.title}
    </span>
</div>

                </div>
            \`;

        });

}




document.addEventListener("keydown", (event) => {


    if (event.key === "Escape") {

    const sidebar =
        document.getElementById("chat-sidebar");

    if (
        sidebar &&
        sidebar.style.left === "0px"
    ) {

        sidebar.style.left = "-270px";

        event.preventDefault();
    }

    return;
}


    const input =
        document.getElementById("global-question");

    if (!(input instanceof HTMLTextAreaElement)) {
        return;
    }

    if (document.activeElement !== input) {
        return;
    }

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        document
            .getElementById("global-send-btn")
            ?.click();
    }

});

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


    const menuBtn = target.closest("#menu-btn");

if (menuBtn) {

    const sidebar =
        document.getElementById("chat-sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.style.left =
        sidebar.style.left === "0px"
            ? "-260px"
            : "0px";

    return;
}

const sidebar = document.getElementById("chat-sidebar");

if (
    sidebar &&
    sidebar.style.left === "0px" &&
    !target.closest("#chat-sidebar") &&
    !target.closest("#menu-btn")
) {
    sidebar.style.left = "-270px";
}



const closeSidebarBtn =
    target.closest("#close-sidebar-btn");

if (closeSidebarBtn) {

    const sidebar =
        document.getElementById("chat-sidebar");

    if (sidebar) {

        sidebar.style.left = "-260px";

    }

    return;
}



const newChatBtn = target.closest("#new-chat-btn");

if (newChatBtn) {

    // Save current chat only if it has messages
 

    createNewChat();

    const history =
        document.getElementById("chat-history");

    if (!history) {
        return;
    }

    history.innerHTML = getWelcomeScreen();

document.getElementById("global-question")?.focus();

    return;
}


const historyItem = target.closest(".history-item");

if (historyItem) {

    const id = Number(historyItem.dataset.id);

    const chat = chatHistory.find(c => c.id === id);

    if (!chat) {
        return;
    }
    currentChat = chat;
    activeChatId = chat.id;

renderChatHistory();
   const history =
    document.getElementById("chat-history");

if (!history) {
    return;
}

history.innerHTML = "";

chat.messages.forEach(message => {

    if (message.role === "user") {

        history.innerHTML += createUserMessage(
            message.content
        );

    } else {

        history.innerHTML += createAIMessage(
            message.content
        );

    }

});
history.scrollTop = history.scrollHeight;
}


const backBtn = target.closest("#back-btn");

if (backBtn) {

    document.getElementById("chat-page").style.display = "none";
    document.getElementById("diagnostics-page").style.display = "block";

    document.getElementById("chat-header").style.display = "none";
    document.getElementById("diagnostics-header").style.display = "flex";

    return;
}

   const askAiBtn = target.closest("#toggle-ai-btn");

if (askAiBtn) {

    const diagnosticsPage =
    document.getElementById("diagnostics-page");

const chatPage =
    document.getElementById("chat-page");
    if (!diagnosticsPage || !chatPage) {
    return;
}

    if (!diagnosticsPage || !chatPage) {
    return;
}

const isChatOpen =
    chatPage.style.display === "block";

if (!isChatOpen) {

    diagnosticsPage.style.display = "none";

    chatPage.style.display = "block";
    document.getElementById("diagnostics-header").style.display = "none";
document.getElementById("chat-header").style.display = "flex";
    

   

    const input =
        document.getElementById("global-question");

    if (input instanceof HTMLTextAreaElement) {
        input.focus();
    }

} else {

    chatPage.style.display = "none";

    diagnosticsPage.style.display = "block";
    document.getElementById("chat-header").style.display = "none";
document.getElementById("diagnostics-header").style.display = "flex";
    
    
}

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

const globalSendBtn = target.closest("#global-send-btn");

if (globalSendBtn) {
if (isGenerating) {

    stopRequested = true;

    isGenerating = false;

    globalSendBtn.textContent = "➤ Send";

    return;
}

    const input =
        document.getElementById("global-question");

    if (!input || !input.value.trim()) {
        return;
    }

    const history =
        document.getElementById("chat-history");

history.innerHTML += createUserMessage(
    input.value.trim()
);
     currentChat.messages.push({

    role: "user",

    content: input.value.trim()

});

if (!currentChat.title) {

    currentChat.title = input.value.trim();

}

const exists = chatHistory.find(
    chat => chat.id === currentChat.id
);

if (!exists) {

    chatHistory.push(currentChat);

    renderChatHistory();

}
    isGenerating = true;

globalSendBtn.textContent = "■ Stop";
    vscode.postMessage({

    command: "globalChat",

    question: input.value.trim()

});
   
    input.value = "";

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

if (message.command === "globalChatLoading") {

    const history =
        document.getElementById("chat-history");

    if (!history) {
        return;
    }

    history.innerHTML += \`
<div
    id="ai-loading"
    style="
        display:flex;
        justify-content:flex-start;
        margin:20px 0;
    ">

    <div style="
        max-width:80%;
        background:#2D2D30;
        border:1px solid #3E3E42;
        border-left:4px solid #4FC3F7;
        padding:16px;
        border-radius:18px 18px 18px 6px;
    ">

        <div style="
            color:#4FC3F7;
            font-size:12px;
            font-weight:bold;
            margin-bottom:10px;
        ">
            🤖 DEBUGVISION AI
        </div>

        <div style="
    display:flex;
    align-items:center;
    gap:10px;
">

    <span style="
        color:#BBBBBB;
        font-size:14px;
    ">
        Thinking
    </span>

    <div class="typing-dots">

        <span></span>

        <span></span>

        <span></span>

    </div>

</div>

    </div>

</div>
\`;

    history.scrollTop = history.scrollHeight;
}

if (message.command === "globalChatResponse") {
    if (stopRequested) {

    stopRequested = false;

    const loading =
        document.getElementById("ai-loading");

    loading?.remove();

    return;
}
    const history =
        document.getElementById("chat-history");

    if (!history) {
        return;
    }

    const loading =
        document.getElementById("ai-loading");


    if (!loading) {
    return;
}


    loading.outerHTML = createAIMessage(
    message.response
);
    currentChat.messages.push({

    role: "assistant",

    content: message.response

});
    history.scrollTop = history.scrollHeight;
isGenerating = false;

const sendBtn =
    document.getElementById("global-send-btn");

if (sendBtn instanceof HTMLButtonElement) {

    sendBtn.textContent = "➤ Send";

}
}

});

</script>

      `;
    return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

${styles}

</head>

<body>

${diagnosticsHeader}

${chatHeader}

${diagnosticsPage}

${chatPage}

${scripts}

</body>

</html>
`;
  }
}