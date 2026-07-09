# 🐞 DebugVision

> AI-powered debugging assistant for Visual Studio Code that explains compiler errors, generates intelligent fixes, and helps developers understand their code through interactive AI conversations.

![VS Code](https://img.shields.io/badge/VS_Code-Extension-007ACC?logo=visualstudiocode)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-green?logo=node.js)
![Ollama](https://img.shields.io/badge/AI-Ollama-orange)

---

## 📖 Overview

DebugVision is an AI-powered debugging assistant built as a Visual Studio Code extension. It analyzes compiler diagnostics, explains errors in beginner-friendly language, suggests AI-generated fixes, and allows developers to chat with AI about their code—all without leaving VS Code.

The extension is designed to reduce debugging time while helping developers understand *why* an error occurred instead of simply showing the solution.

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
AI Service
      │
      ▼
Ollama
      │
      ▼
LLM Response
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

## 📂 Project Structure

```
extension/
│
├── ai/
│   ├── providers/
│   ├── PromptBuilder.ts
│   └── AIService.ts
│
├── commands/
│
├── panels/
│
├── services/
│
├── utils/
│
└── extension.ts
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/debugvision.git
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