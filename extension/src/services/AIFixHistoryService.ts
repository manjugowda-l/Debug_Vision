import * as vscode from "vscode";

export type AIFixHistoryEntry = {
  documentUri: vscode.Uri;
  filePath: string;
  range: vscode.Range;
  originalText: string;
  replacementText: string;
  timestamp: number;
};

export class AIFixHistoryService {
  private static instance: AIFixHistoryService;

  private undoStack: AIFixHistoryEntry[] = [];
  private redoStack: AIFixHistoryEntry[] = [];

  private constructor() {}

  public static getInstance(): AIFixHistoryService {
    if (!AIFixHistoryService.instance) {
      AIFixHistoryService.instance = new AIFixHistoryService();
    }

    return AIFixHistoryService.instance;
  }

  public recordFix(entry: AIFixHistoryEntry): void {
    this.undoStack.push(entry);
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public async undo(): Promise<AIFixHistoryEntry | undefined> {
   console.log("Undo stack size:", this.undoStack.length);
    if (!this.canUndo()) {
      return undefined;
    }

    const entry = this.undoStack.pop();
    if (!entry) {
      return undefined;
    }

    const document = await vscode.workspace.openTextDocument(entry.documentUri);

const edit = new vscode.WorkspaceEdit();
edit.replace(document.uri, entry.range, entry.originalText);

const applied = await vscode.workspace.applyEdit(edit);

if (applied) {
    await vscode.window.showTextDocument(document, { preview: false });
    await document.save();
}
if (!applied) {
      this.undoStack.push(entry);
      return undefined;
    }

    this.redoStack.push(entry);
    return entry;
  }

  public async redo(): Promise<AIFixHistoryEntry | undefined> {
    if (!this.canRedo()) {
      return undefined;
    }

    const entry = this.redoStack.pop();
    if (!entry) {
      return undefined;
    }

    const document = await vscode.workspace.openTextDocument(entry.documentUri);

const edit = new vscode.WorkspaceEdit();
edit.replace(document.uri, entry.range, entry.replacementText);

const applied = await vscode.workspace.applyEdit(edit);

if (applied) {
    await vscode.window.showTextDocument(document, { preview: false });
    await document.save();
}
if (!applied) {
      this.redoStack.push(entry);
      return undefined;
    }

    this.undoStack.push(entry);
    return entry;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
