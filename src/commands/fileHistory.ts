import * as vscode from 'vscode';
import { getGitRepositoryPath } from '../helpers/gitPaths';
import * as historyUtil from '../helpers/historyUtils';
import * as path from 'path';
import * as tmp from 'tmp';
import * as logger from '../logger';
import { CommitInfo, formatDate } from '../helpers/logParser';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('git.viewFileHistory', (fileUri?: vscode.Uri) => {
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
        run(fileName);
    });
    context.subscriptions.push(disposable);
}



export async function run(fileName: string) {
    try {
        const gitRepositoryPath = await getGitRepositoryPath(fileName);
        const relativeFilePath = path.relative(gitRepositoryPath, fileName);
        const fileHistory = await historyUtil.getFileHistory(gitRepositoryPath, relativeFilePath);

        if (fileHistory.length === 0) {
            vscode.window.showInformationMessage(`There are no history items for this item '${relativeFilePath}'.`);
            return;
        }

        let itemPickList: vscode.QuickPickItem[] = fileHistory.map(item => {
            let dateTime = formatDate(new Date(Date.parse(item.author_date)));
            let label = <string>vscode.workspace.getConfiguration('gitHistory').get('displayLabel');
            let description = <string>vscode.workspace.getConfiguration('gitHistory').get('displayDescription');
            let detail = <string>vscode.workspace.getConfiguration('gitHistory').get('displayDetail');

            const firstLineofMessage = item.message.split('\n')[0];

            label = label.replace('${date}', dateTime).replace('${name}', item.author_name)
                .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);
            description = description.replace('${date}', dateTime).replace('${name}', item.author_name)
                .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);
            detail = detail.replace('${date}', dateTime).replace('${name}', item.author_name)
                .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);

            return { label: label, description: description, detail: detail, data: item };
        });

        itemPickList.forEach((item, index) => {
            if (index === (itemPickList.length - 1)) {
                (<any>item).isLast = true;
            }
            else {
                (<any>item).data.previousSha1 = fileHistory[index + 1].sha1;
            }
        });

        vscode.window.showQuickPick(itemPickList, { placeHolder: '', matchOnDescription: true, matchOnDetail: true }).then(item => {
            if (!item) {
                return;
            }
            onItemSelected(item, fileName, relativeFilePath);
        });
    }
    catch (error) {
        logger.logError(error);
    }
}

export async function getFileCommitHistory(sha1: string, relativeFilePath: string, isoStrictDateTime: string, gitGitRepositoryPath: string): Promise<CommitInfo & { previousSha1: string } | undefined> {
    // const fileName = path.join(gitGitRepositoryPath, relativeFilePath);
    const data = await historyUtil.getFileHistoryBefore(gitGitRepositoryPath, relativeFilePath, isoStrictDateTime);
    const historyItem = data.find(data => data.sha1 === sha1);
    if (!historyItem) {
        return;
    }
    const previousItems = data.filter(data => data.sha1 !== sha1);
    const previousSha1 = previousItems.length === 0 ? '' : previousItems[0].sha1 as string;
    return {
        ...historyItem!,
        previousSha1
    };
}
export async function onItemSelected(item: vscode.QuickPickItem, fileName: string, relativeFilePath: string) {
    const commit = (<any>item).data;
    const gitRepositoryPath = await getGitRepositoryPath(fileName);
    const getThisFile = getFile(commit.sha1, gitRepositoryPath, relativeFilePath);
    const getPreviousFile = getFile(commit.previousSha1, gitRepositoryPath, relativeFilePath);

    const thisFile = await getThisFile;
    const previousFile = await getPreviousFile;

    const itemPickList: vscode.QuickPickItem[] = [];
    itemPickList.push({ label: 'View Change Log', description: 'Author, committer and message' });
    if (thisFile.length > 0) {
        itemPickList.push({ label: 'View File Contents', description: '' });
    }
    if (thisFile.length > 0 && fs.existsSync(fileName)) {
        itemPickList.push({ label: 'Compare against workspace file', description: '' });
    }
    if (previousFile.length > 0 && thisFile.length > 0) {
        itemPickList.push({ label: 'Compare against previous version', description: '' });
    }

    vscode.window.showQuickPick(itemPickList, { placeHolder: item.label, matchOnDescription: true }).then(cmd => {
        if (!cmd) {
            return;
        }
        const data = (<any>item).data;
        if (cmd.label === 'View Change Log') {
            viewLog(data);
            return;
        }
        if (cmd.label === 'View File Contents') {
            viewFile(thisFile);
            return;
        }
        if (cmd.label === 'Compare against workspace file') {
            diffFiles(fileName, thisFile, commit.sha1, fileName, '');
            return;
        }
        if (cmd.label === 'Compare against previous version') {
            diffFiles(fileName, previousFile, commit.previousSha1, thisFile, commit.sha1);
            return;
        }
    });
}

export async function viewFile(fileName: string) {
    try {
        vscode.workspace.openTextDocument(fileName).then(document => {
            vscode.window.showTextDocument(document);
        });
    }
    catch (error) {
        logger.logError(error);
    }
}

export function viewLog(details: CommitInfo) {
    let authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
    let committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
    let log = `sha1 : ${details.sha1}\n` +
        `Author : ${details.author_name} <${details.author_email}>\n` +
        `Author Date : ${authorDate}\n` +
        `Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
        `Commit Date : ${committerDate}\n` +
        `Message : ${details.message}`;

    logger.showInfo(log);
}

export function diffFiles(fileName: string, sourceFile: string, sourceSha1: string, destinationFile: string, destinationSha1: string) {
    try {
        const sourceFormattedSha1 = `(${sourceSha1.substring(0, 7)})`;
        const destinationFormattedSha1 = destinationSha1 !== '' ? `(${destinationSha1.substring(0, 7)})` : '';
        vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(sourceFile), vscode.Uri.file(destinationFile),
            `${path.basename(fileName)} ${sourceFormattedSha1} ↔ ${path.basename(fileName)} ${destinationFormattedSha1}`);
    }
    catch (error) {
        logger.logError(error);
    }
}

export async function getFile(commitSha1: string, gitRepositoryPath: string, localFilePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (commitSha1 === undefined) {
            resolve('');
            return;
        }
        let ext = path.extname(localFilePath);
        tmp.file({ postfix: ext }, async function _tempFileCreated(err: any, tmpFilePath: string, fd: number, cleanupCallback: () => void) {
            if (err) {
                reject(err);
                return;
            }
            try {
                const targetFile = await historyUtil.writeFile(gitRepositoryPath, commitSha1, localFilePath, tmpFilePath);
                resolve(targetFile);
            }
            catch (ex) {
                logger.logError(ex);
                reject(ex);
            }
        });
    });
}