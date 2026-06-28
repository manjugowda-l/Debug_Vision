/**
 * Extension type definitions
 */

import * as vscode from 'vscode';

export interface ICommand {
  register(): vscode.Disposable;
}

export interface IExtensionContext {
  isActivated: boolean;
  version: string;
}
