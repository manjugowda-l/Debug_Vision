# 🐞 DebugVision

> **An AI-powered debugging assistant for Visual Studio Code that explains compiler errors, generates intelligent fixes, and helps developers debug with confidence.**

![VS Code Extension](https://img.shields.io/badge/VS_Code-Extension-007ACC?logo=visualstudiocode&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Qwen2.5--7B-orange)
![MIT License](https://img.shields.io/badge/License-MIT-green)

---

> 📸 **Main DebugVision Panel**

<!-- Replace with your actual screenshot -->

<p align="center">
  <img src="images/main-panel.png" alt="DebugVision Main Panel" width="900">
</p>

---

## 📖 Overview

DebugVision is an AI-powered Visual Studio Code extension designed to make debugging faster, easier, and more educational. Instead of only displaying compiler errors, it explains **why** an error occurred, suggests AI-generated fixes, and enables developers to interact with an AI assistant—all without leaving the editor.

Whether you're a beginner learning programming concepts or an experienced developer looking to speed up debugging, DebugVision helps you understand errors, apply fixes confidently, and stay focused on writing better code.

---

## ✨ Features

### 🤖 AI Error Explanation

- Beginner-friendly compiler error explanations
- Explains why the error occurred
- Provides the correct approach
- Shows a corrected example
- Includes programming best practices

---

### 🛠 AI Fix Suggestions

- AI-generated fixes for compiler errors
- Side-by-side preview before applying
- Confidence score
- One-click Apply Fix

---

### 💬 AI Chat

Ask follow-up questions such as:

- Why did this error happen?
- Explain this code.
- Is there a better approach?
- What does this compiler message mean?

without leaving VS Code.

---

### ⚡ Smart Performance

- AI Explanation Caching
- AI Fix Caching
- Faster repeated operations
- Reduced unnecessary AI requests

---

### 🎯 Smart Editor Integration

- Detects active file automatically
- Updates diagnostics while switching files
- Works directly with VS Code Diagnostics API
- Refreshes instantly when diagnostics change

---

### 📋 Productivity Features

- Copy corrected code
- Loading animations
- Modern chat interface
- Professional explanation layout
- Clean UI

---

## 📸 Screenshots

### Main Debug Panel

> *(Add screenshot here)*

```
images/main-panel.png
```

---

### AI Error Explanation

> *(Add screenshot here)*

```
images/explanation.png
```

---

### AI Fix Preview

> *(Add screenshot here)*

```
images/fix-preview.png
```

---

### AI Chat

> *(Add screenshot here)*

```
images/chat.png
```

---

## 🏗 Architecture

```
VS Code
     │
     ▼
DebugVision Extension
     │
     ▼
Diagnostics Engine
     │
     ▼
AI Service
     │
     ▼
Ollama
     │
     ▼
AI Response
     │
     ▼
Debug Panel

```

---

## 🛠 Tech Stack

- TypeScript
- Node.js
- Visual Studio Code Extension API
- Ollama
- HTML
- CSS
- JavaScript

---

## 🏗️ Architecture & Project Structure

```
extension/
│
├── src/
│   ├── ai/
│   │   ├── providers/
│   │   ├── AIService.ts
│   │   ├── PromptBuilder.ts
│   │   └── DebugSessionManager.ts
│   │
│   ├── commands/
│   │   ├── StartDebugSession.ts
│   │   └── HelloWorld.ts
│   │
│   ├── panels/
│   │   └── DebugPanel.ts
│   │
│   ├── services/
│   │   ├── DiagnosticsService.ts
│   │   ├── DiagnosticsCacheService.ts
│   │   ├── WorkspaceService.ts
│   │   ├── LoggerService.ts
│   │   └── AIFixHistoryService.ts
│   │
│   ├── types/
│   ├── utils/
│   ├── views/
│   └── extension.ts
│
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/manjugowda-l/Debug_Vision.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build

```bash
npm run compile
```

### 4. Start Ollama

```bash
ollama serve
```

Pull the model if required:

```bash
ollama pull llama3
```

### 5. Run the extension

Press

```
F5
```

to launch the Extension Development Host.

---

## 💡 Usage

1. Open a project with compiler errors.
2. Start **DebugVision**.
3. Select an error.
4. Click **Explain** for AI explanation.
5. Click **Apply Fix** to preview corrections.
6. Chat with AI for additional guidance.

---

## 🎯 Roadmap

### Version 1.0

- ✅ AI Explain
- ✅ AI Fix
- ✅ AI Chat
- ✅ Explanation Cache
- ✅ Fix Cache
- ✅ Active File Detection
- ✅ Modern UI

### Future Improvements

- Workspace-wide analysis
- Persistent chat history
- Streaming AI responses
- Multiple AI provider support
- Voice input
- Cloud AI integration

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome.

Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Manju Gowda**

GitHub: https://github.com/manjugowda-l

Feel free to connect, raise issues, or contribute to the project.