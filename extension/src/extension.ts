/**
 * DebugVision Extension Entry Point
 * 
 * Milestone 1: Foundation
 * - Extension activation
 * - Command registration
 * - Basic initialization
 */

import * as vscode from 'vscode';
import { HelloWorldCommand } from './commands/helloWorld';
import { ExtensionService } from './services';

const extensionName = 'DebugVision';
const extensionVersion = '0.1.0';

/**
 * Activates the DebugVision extension.
 * Called when the extension is first activated.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log(`${extensionName} extension is now active (v${extensionVersion})`);

  // Initialize extension service
  const extensionService = ExtensionService.getInstance();
  extensionService.initialize();

  // Register commands
  const helloWorldCommand = new HelloWorldCommand();
  context.subscriptions.push(helloWorldCommand.register());

  // Store activation state in memento
  context.globalState.update('debugvision:isActivated', true);
}

/**
 * Deactivates the extension when VS Code is shutting down.
 */
export function deactivate(): void {
  console.log(`${extensionName} extension is now deactivated`);
}
