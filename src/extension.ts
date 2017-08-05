// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fileHistory from './commands/fileHistory';
import * as lineHistory from './commands/lineHistory';
import * as logViewer from './logViewer/logViewer';
import * as commitViewer from './commitViewer/main';
import * as commitComparer from './commitCompare/main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    fileHistory.activate(context);
    lineHistory.activate(context);
    commitViewer.activate(context, logViewer.getGitRepoPath);
    logViewer.activate(context, commitViewer.showLogEntries);
    commitComparer.activate(context, logViewer.getGitRepoPath);
}
