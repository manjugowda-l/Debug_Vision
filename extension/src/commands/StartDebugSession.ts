import * as vscode from "vscode";

import { AIService } from "../ai";
import { DebugSessionManager } from "../ai/DebugSessionManager";
import { DebugPanel } from "../panels/DebugPanel";
import { DiagnosticsService } from "../services/DiagnosticsService";
import { WorkspaceService } from "../services/WorkspaceService";

export class StartDebugSessionCommand {
  public register(): vscode.Disposable {
    return vscode.commands.registerCommand(
      "debugvision.startDebugSession",
      async () => {
        const sessionManager = DebugSessionManager.getInstance();

        if (sessionManager.isSessionActive()) {
          vscode.window.showInformationMessage(
            "DebugVision AI Debug Session is already running."
          );
          return;
        }

        // Make sure a file is open
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
          vscode.window.showErrorMessage(
            "Please open a source file before starting DebugVision."
          );
          return;
        }

        // Tell DiagnosticsService which file is being debugged
        DiagnosticsService.getInstance().setCurrentDocument(
          editor.document.uri
        );

        WorkspaceService.getInstance().setActiveDocument(
          editor.document
        );

        WorkspaceService.getInstance().setActiveEditor(
            editor
        );

        sessionManager.startSession();

        try {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Starting DebugVision AI Debug Session...",
              cancellable: false
            },
            async () => {
              // Open the live Debug Panel
              const panel = DebugPanel.createOrShow();

              setTimeout(() => {
                  panel.refresh();
              }, 200);
              // Ask AI to analyze
              const aiService = AIService.getInstance();
              await aiService.analyzeCurrentFile();
            }
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to start Debug Session."
          );
        }
      }
    );
  }
}