import * as vscode from "vscode";
import { LoggerService } from "./LoggerService";

export class WorkspaceService {
  private static instance: WorkspaceService;

  private readonly logger = LoggerService.getInstance();

  private activeEditor?: vscode.TextEditor;

  private constructor() {}

  

  public static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }

    return WorkspaceService.instance;
  }

  /**
   * Returns true if a workspace is currently open.
   */
  public hasWorkspace(): boolean {
    return vscode.workspace.workspaceFolders !== undefined;
  }

  /**
   * Returns the root path of the current workspace.
   */
  public getWorkspaceRoot(): string | undefined {
    if (!this.hasWorkspace()) {
      return undefined;
    }

    return vscode.workspace.workspaceFolders![0].uri.fsPath;
  }

  /**
   * Returns the currently active editor.
   */
  public getActiveEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  /**
   * Returns the currently active document.
   */
  public getActiveDocument(): vscode.TextDocument | undefined {
    return vscode.window.activeTextEditor?.document;
}

  /**
   * Returns the full path of the active file.
   */
  public getActiveFilePath(): string | undefined {
    return this.getActiveDocument()?.uri.fsPath;
  }

  /**
   * Returns the contents of the active file.
   */
  public getActiveFileContent(): string | undefined {
    return vscode.window.activeTextEditor?.document.getText();
}
  /**
   * Logs workspace information.
   */
  public logWorkspaceInfo(): void {
    this.logger.separator();
    this.logger.info("DebugVision Workspace");

    this.logger.info(`Workspace Open : ${this.hasWorkspace()}`);
    this.logger.info(`Workspace Root : ${this.getWorkspaceRoot()}`);
    this.logger.info(`Active File    : ${this.getActiveFilePath()}`);
    this.logger.info(
      `Active Editor  : ${this.getActiveEditor() ? "Available" : "None"}`
    );

    this.logger.separator();
  }

  public getWorkspaceName(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.name;
  }

  public getActiveFileName(): string | undefined {
    return vscode.window.activeTextEditor?.document.fileName
        .split("\\")
        .pop();
}

  public getLanguageId(): string | undefined {
    return vscode.window.activeTextEditor?.document.languageId;
}

  public getLineCount(): number {
    return this.getActiveDocument()?.lineCount ?? 0;
  }

  public getSelectedText(): string {
    const editor = this.getActiveEditor();

    if (!editor) {
      return "";
    }

    return editor.document.getText(editor.selection);
  }

  public getCursorPosition(): vscode.Position | undefined {
    return this.getActiveEditor()?.selection.active;
  }

  public getCurrentLineNumber(): number | undefined {
    return this.getCursorPosition()?.line;
  }

  public getCurrentColumnNumber(): number | undefined {
    return this.getCursorPosition()?.character;
  }

  public getCurrentLineText(): string | undefined {
    const editor = this.getActiveEditor();

    if (!editor) {
      return undefined;
    }

    return editor.document.lineAt(editor.selection.active.line).text;
  }

  public getFileSize(): number {
    return this.getActiveFileContent()?.length ?? 0;
  }


  public setActiveEditor(
    editor: vscode.TextEditor
): void {

    this.activeEditor = editor;

}

public getStoredEditor():
    vscode.TextEditor | undefined {

    return this.activeEditor;

}
}