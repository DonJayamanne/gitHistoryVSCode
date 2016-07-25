// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as history from './commands/fileHistory';
import * as lineHistory from './commands/lineHistory';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	var outChannel: vscode.OutputChannel;
	outChannel = vscode.window.createOutputChannel('Git');
	//outChannel.clear();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "githistory" is now active!');
	var outChannel: vscode.OutputChannel;
	outChannel = vscode.window.createOutputChannel('Git');
    var disposable = vscode.commands.registerCommand('git.viewFileHistory', (fileUri?: vscode.Uri) => {
        outChannel.clear();
		let fileName = '';
		if (fileUri) {
			fileName = fileUri.fsPath;
		}
		else {
			if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
				return;
			}
			fileName = vscode.window.activeTextEditor.document.fileName
		}
		history.run(outChannel, fileName);
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
		outChannel.clear();
		lineHistory.run(outChannel);
	});
	context.subscriptions.push(disposable);
}
