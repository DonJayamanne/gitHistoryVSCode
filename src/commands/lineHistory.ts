import * as vscode from 'vscode';
import * as historyUtil from '../helpers/historyUtils';
import * as path from 'path';
import * as fs from 'fs';

export function run(outChannel: vscode.OutputChannel): any {
	if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
		return;
	}
	if (!vscode.window.activeTextEditor.selection) {
		return;
	}

    historyUtil.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then(
        (gitRepositoryPath) => {

        let relativeFilePath = path.relative(gitRepositoryPath, vscode.window.activeTextEditor.document.fileName);

	var currentLineNumber = vscode.window.activeTextEditor.selection.start.line + 1;

        historyUtil.getLineHistory(gitRepositoryPath, relativeFilePath, currentLineNumber).then(displayHistory, genericErrorHandler);

	function displayHistory(log: any[]) {
		if (log.length === 0) {
			vscode.window.showInformationMessage("There are no history items for this item '`${relativeFilePath}`'.");
			return;
		}

		var itemPickList: vscode.QuickPickItem[] = log.map(item=> {
			var dateTime = new Date(Date.parse(item.author_date)).toLocaleString();
			var label = `${item.author_name} <${item.author_email}> on ${dateTime}`;
			var description = item.message;
			return { label: label, description: description, data: item };
		});

		vscode.window.showQuickPick(itemPickList, { placeHolder: "Select an item to view the change log", matchOnDescription: true }).then(item=> {
			if (!item) {
				return;
			}
			onItemSelected(item);
		});
	}

	function onItemSelected(item: vscode.QuickPickItem) {
		viewLog((<any>item).data);
	}

	function viewLog(details) {
		var authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
		var committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
		var log = `sha1 : ${details.sha1}\n` +
			`Author : ${details.author_name} <${details.author_email}>\n` +
			`Author Date : ${authorDate}\n` +
			`Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
			`Commit Date : ${committerDate}\n` +
			`Message : ${details.message}`;

		outChannel.appendLine(log);
		outChannel.show();
	}

	function genericErrorHandler(error) {
        if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git') {
            vscode.window.showErrorMessage("Cannot find the git installation");
        } else {
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage("There was an error, please view details in output log");
        }
	}
    });
}

