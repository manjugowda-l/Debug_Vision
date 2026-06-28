/**
 * DebugVision: Hello World Command
 * 
 * Simple command to verify extension activation and command registration.
 */

import * as vscode from 'vscode';
import { ICommand } from '../types';
import { logToConsole } from '../utils';

export class HelloWorldCommand implements ICommand {
  private static readonly COMMAND_ID = 'debugvision.helloWorld';

  public register(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      HelloWorldCommand.COMMAND_ID,
      this.execute.bind(this)
    );

    logToConsole('HelloWorld command registered');
    return disposable;
  }

  private async execute(): Promise<void> {
    const message = 'DebugVision successfully initialized.';
    await vscode.window.showInformationMessage(message);
    logToConsole(`Command executed: ${message}`);
  }
}
