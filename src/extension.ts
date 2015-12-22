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
	//outChannel.clear();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.viewGitHistory', () => {
		var itemPickList: vscode.QuickPickItem[] = [
			{ label: "View File History", description: "" },
			{ label: "View Line History", description: "" }
		];

		vscode.window.showQuickPick(itemPickList).then(item=> {
			if (!item) {
				return;
			}

			outChannel.clear();
			if (item.label === itemPickList[0].label) {
				history.run(outChannel);
			}
			else {
				lineHistory.run(outChannel);
			}
		});
	});


	context.subscriptions.push(disposable);
}
