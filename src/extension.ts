// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
import { CommandRegister } from './commands/register';
import { DiContainer } from './ioc/container';
import { setDiContainer } from './ioc/index';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { ILogViewer } from './logViewer/types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    const container = DiContainer.getInstance();
    setDiContainer(container);
    context.subscriptions.push(container);
    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
    const logViewer = container.get<ILogViewer>(ILogViewer);
    context.subscriptions.push(logViewer);
    context.subscriptions.push(new CommandRegister());
}
