// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as history from './commands/fileHistory';
import * as lineHistory from './commands/lineHistory';
import * as viewer from './logViewer/main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel('Git History');
    history.activate(outChannel);
    let disposable = vscode.commands.registerCommand('git.viewFileHistory', (fileUri?: vscode.Uri) => {
        outChannel.clear();
        let fileName = '';
        if (fileUri && fileUri.fsPath) {
            fileName = fileUri.fsPath;
        }
        else {
            if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
                return;
            }
            fileName = vscode.window.activeTextEditor.document.fileName;
        }
        history.run(fileName);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
        outChannel.clear();
        lineHistory.run(outChannel);
    });
    context.subscriptions.push(disposable);

    viewer.activate(context, outChannel);
}
