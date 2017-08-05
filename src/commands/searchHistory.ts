import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('git.searchHistory', async () => {
        let searchText = await vscode.window.showInputBox({prompt: 'Search in GIT Commits'});
        if(searchText !== undefined && searchText !== '') {
            vscode.commands.executeCommand("git.viewHistory", null, searchText);
        }
    });
    context.subscriptions.push(disposable);
}

