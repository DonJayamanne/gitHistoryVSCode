import * as vscode from 'vscode';
import * as historyUtil from '../helpers/historyUtils';
import * as gitPaths from '../helpers/gitPaths';
import * as path from 'path';
import * as logger from '../logger';


export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
        run();
    });
    context.subscriptions.push(disposable);
}

export async function run(): Promise<any> {
    try {
        if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
            return;
        }
        if (!vscode.window.activeTextEditor.selection) {
            return;
        }

        const gitRepositoryPath = await gitPaths.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName);
        const relativeFilePath = path.relative(gitRepositoryPath, vscode.window.activeTextEditor.document.fileName);
        const currentLineNumber = vscode.window.activeTextEditor.selection.start.line + 1;
        const log: any[] = await historyUtil.getLineHistory(gitRepositoryPath, relativeFilePath, currentLineNumber);
        if (log.length === 0) {
            vscode.window.showInformationMessage('There are no history items for this item "`${relativeFilePath}`".');
            return;
        }

        let itemPickList: vscode.QuickPickItem[] = log.map(item => {
            let dateTime = new Date(Date.parse(item.author_date)).toLocaleString();
            let label = `${item.author_name} <${item.author_email}> on ${dateTime}`;
            let description = item.message;
            return { label: label, description: description, data: item };
        });

        vscode.window.showQuickPick(itemPickList, { placeHolder: 'Select an item to view the change log', matchOnDescription: true }).then(item => {
            if (!item) {
                return;
            }
            onItemSelected(item);
        });
    }
    catch (error) {
        logger.logError(error);
    }
}

function onItemSelected(item: vscode.QuickPickItem) {
    viewLog((<any>item).data);
}

function viewLog(details: any) {
    let authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
    let committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
    let log = `Hash : ${details.hash}\n` +
        `Author : ${details.author_name} <${details.author_email}>\n` +
        `Author Date : ${authorDate}\n` +
        `Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
        `Commit Date : ${committerDate}\n` +
        `Message : ${details.message}`;

    logger.showInfo(log);
}
