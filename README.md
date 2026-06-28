# DebugVision

A production-grade, AI-powered VS Code Extension for intelligent debugging. This is Milestone 1 - the professional foundation.

## Project Structure

```
DebugVision/
├── extension/          # VS Code Extension (TypeScript)
├── backend/            # Express.js Backend (TypeScript)
├── shared/             # Shared Types & Interfaces
├── scripts/            # Build & Development Scripts
├── .github/            # GitHub Workflows
├── package.json        # Root Workspace Config
├── tsconfig.json       # TypeScript Base Config
├── .eslintrc.json      # ESLint Configuration
└── .prettierrc.json    # Prettier Configuration
```

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js LTS
- **Package Manager:** npm with workspaces
- **Backend:** Express.js
- **Extension API:** VS Code Extension API
- **Linting:** ESLint
- **Formatting:** Prettier

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
npm install
```

This command will:
1. Install root dependencies
2. Install workspace dependencies (extension, backend, shared)

## Development

### Build All Workspaces

```bash
npm run build
```

### Run Development Mode

```bash
npm run dev
```

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Extension (Milestone 1)

Located in `/extension`

- **Command:** `DebugVision: Hello World`
- **Status:** Successfully compiles and activates
- **Purpose:** Verify extension architecture works end-to-end

### Running the Extension

1. Press `F5` in VS Code with the extension workspace open
2. VS Code Extension Development Host launches
3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
4. Search for "DebugVision: Hello World"
5. Execute to see success message

## Backend (Milestone 1)

Located in `/backend`

- **Framework:** Express.js
- **Language:** TypeScript
- **Status:** Ready for deployment

### Running the Backend

```bash
cd backend
npm run dev
```

Backend starts on `http://localhost:3000`

### Available Endpoints

- `GET /` - Service health check

**Response:**
```json
{
  "status": "running",
  "service": "DebugVision Backend"
}
```

## Shared Module

Located in `/shared`

Central repository for:
- Type definitions
- Interfaces
- Constants
- Utilities

Used by both extension and backend.

## Quality Standards

✓ Clean Architecture  
✓ Meaningful Naming  
✓ No Code Duplication  
✓ Production-Quality Code  
✓ Full TypeScript Support  
✓ ESLint Compliant  
✓ Prettier Formatted  

## Roadmap

**Milestone 1 (Current)** ✓
- Project Foundation
- Extension Architecture
- Backend Structure
- Shared Module Setup

**Future Milestones**
- AI/LLM Integration
- Error Detection Engine
- Learning Mode
- Analytics
- Authentication
- Advanced Debugging Features

## License

MIT
