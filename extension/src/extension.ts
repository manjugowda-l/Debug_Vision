/**
 * DebugVision Extension Entry Point
 *
 * Milestone 1: Foundation
 * - Extension activation
 * - Command registration
 * - Basic initialization
 */

import * as vscode from "vscode";
import { HelloWorldCommand } from "./commands/helloWorld";
import { ExtensionService } from "./services";
import { StartDebugSessionCommand } from "./commands/StartDebugSession";


const extensionName = "DebugVision";
const extensionVersion = "1.0.0";

/**
 * Activates the DebugVision extension.
 * Called when the extension is first activated.
 */
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  // Initialize extension service
  const extensionService = ExtensionService.getInstance();
  extensionService.initialize();

  const logger = extensionService.getLoggerService();
  const diagnosticsService = extensionService.getDiagnosticsService();
  
  logger.info(`${extensionName} extension is now active (v${extensionVersion})`);

  // Register commands
  const helloWorldCommand = new HelloWorldCommand();
  const startDebugSessionCommand = new StartDebugSessionCommand();

  context.subscriptions.push(helloWorldCommand.register());
  context.subscriptions.push(startDebugSessionCommand.register());
    logger.info("HelloWorld command registered");

  // Refresh diagnostics whenever VS Code updates them
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(() => {
      //logger.info("Diagnostics updated");
      diagnosticsService.logDiagnostics();
    })
  );

  // Refresh workspace information when switching editors
  //context.subscriptions.push(
  //  vscode.window.onDidChangeActiveTextEditor(() => {
  //    //logger.info("Active editor changed");
  //    extensionService.getWorkspaceService().logWorkspaceInfo();
  //    diagnosticsService.logDiagnostics();
  //  })
  //);

  // Refresh diagnostics whenever the document changes
  //context.subscriptions.push(
  //  vscode.workspace.onDidChangeTextDocument(() => {
  //    //logger.info("Document changed");
  //    diagnosticsService.logDiagnostics();
  //  })
  //);

  // Store activation state in memento
  await context.globalState.update("debugvision:isActivated", true);
}

/**
 * Deactivates the extension when VS Code is shutting down.
 */

export function deactivate(): void {
  const logger = LoggerSafe();

  if (logger) {
    logger.info(`${extensionName} extension is now deactivated`);
    logger.separator();
  }
}

/**
 * Safely retrieves the logger during shutdown.
 */
function LoggerSafe() {
  try {
    return ExtensionService.getInstance().getLoggerService();
  } catch {
    return undefined;
  }
}