# DebugVision Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- VS Code >= 1.85.0 (for extension development)

## Installation

```bash
# Clone repository
cd Debug_Vision

# Install all dependencies
npm install
```

This will install:
- Root dependencies (TypeScript, ESLint, Prettier)
- Extension dependencies (@types/vscode)
- Backend dependencies (Express.js)
- Shared module dependencies

## Building the Project

### Build All Workspaces
```bash
npm run build
```

### Build Individual Workspaces

**Shared Module**:
```bash
cd shared
npm run build
```

**Extension**:
```bash
cd extension
npm run build
```

**Backend**:
```bash
cd backend
npm run build
```

## Running the Extension

### Development Mode

1. Open VS Code with extension workspace:
   ```bash
   code extension
   ```

2. Press `F5` to launch **Extension Development Host**

3. In the development host, open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

4. Search for: `DebugVision: Hello World`

5. Execute the command

6. See the success message: **"DebugVision successfully initialized."**

## Running the Backend

### Start Backend Server

```bash
cd backend
npm run dev
```

**Output**:
```
[2026-06-28T03:03:56.980Z] [INFO] Server started on http://localhost:3000
[2026-06-28T03:03:56.983Z] [INFO] Environment: development
```

### Test Health Endpoint

```bash
curl http://localhost:3000/
```

**Response**:
```json
{
  "status": "running",
  "service": "DebugVision Backend",
  "timestamp": "2026-06-28T03:04:14.626Z",
  "uptime": 2
}
```

## Code Quality

### Lint Code

```bash
npm run lint --workspaces
```

### Format Code

```bash
npm run format
```

### Check Format Without Changes

```bash
npm run format:check
```

## Project Structure

```
DebugVision/
├── extension/         # VS Code Extension
├── backend/           # Express.js API Server
├── shared/            # Shared Types & Interfaces
├── scripts/           # Build Scripts
├── .github/           # GitHub Workflows
├── package.json       # Workspace Configuration
├── tsconfig.json      # TypeScript Configuration
├── .eslintrc.json     # ESLint Configuration
├── .prettierrc.json   # Prettier Configuration
├── .gitignore
├── README.md
└── VERIFICATION.md    # Milestone 1 Verification
```

## Development Workflow

### 1. Make Changes to Source Code

Files in `*/src/` are watched during development.

### 2. TypeScript Compilation

TypeScript files automatically compile to `dist/` directories.

### 3. Run Tests

```bash
npm run test --workspaces
```

### 4. Lint and Format

```bash
npm run lint --workspaces
npm run format
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: your feature description"
git push
```

## Troubleshooting

### Module Not Found

```bash
# Clear node_modules and reinstall
npm run clean
npm install
```

### TypeScript Compilation Error

```bash
# Verify TypeScript configuration
npx tsc --diagnostics

# Rebuild from scratch
npm run clean
npm run build
```

### Extension Not Showing in Command Palette

1. Ensure extension is activated (`onStartupFinished`)
2. Check extension output in VS Code (`View > Output`)
3. Search for "DebugVision" in Command Palette
4. Try reloading the Extension Development Host (press `Ctrl+R`)

### Backend Port Already in Use

Change the port:
```bash
PORT=3001 npm run dev
```

## Debugging

### Extension Debug

In VS Code Extension Development Host:
1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
2. Type: "Developer: Show Running Extensions"
3. Check if "DebugVision" is listed

### Backend Debug

Monitor logs while running:
```bash
cd backend
npm run dev 2>&1 | tee debug.log
```

## Resources

- **Extension Documentation**: [VS Code Extension API](https://code.visualstudio.com/api)
- **Express.js Documentation**: [Express Docs](https://expressjs.com/)
- **TypeScript Documentation**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **ESLint Configuration**: [ESLint Docs](https://eslint.org/docs/)
- **Prettier Documentation**: [Prettier Docs](https://prettier.io/docs/)

## Next Steps

1. ✅ Milestone 1 Complete - Foundation is ready
2. Review VERIFICATION.md for detailed verification report
3. Proceed to Milestone 2 for AI/LLM integration

---

For more information, see [README.md](./README.md) and [VERIFICATION.md](./VERIFICATION.md)
