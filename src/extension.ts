// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
import { CommandRegister } from './commands/register';
import { getDiContainer } from './ioc';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { LogViewer } from './logViewer/logViewer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    const container = getDiContainer();
    context.subscriptions.push(container);
    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
    const logViewer = container.get<LogViewer>(LogViewer);
    context.subscriptions.push(logViewer);
    context.subscriptions.push(new CommandRegister());
}
