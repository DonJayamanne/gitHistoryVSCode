import * as vscode from 'vscode';
import { getGitRepositoryPath } from '../helpers/gitPaths';
import * as historyUtil from '../helpers/historyUtils';
import * as path from 'path';
import * as tmp from 'tmp';
import { decode as htmlDecode }  from 'he';
import * as logger from '../logger';
import { formatDate } from '../helpers/logParser';

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

vscode.commands.registerCommand('git.viewFileCommitDetails', async (sha1: string, relativeFilePath: string, isoStrictDateTime: string) => {
    try {
        relativeFilePath = htmlDecode(relativeFilePath);
        const fileName = path.join(vscode.workspace.rootPath, relativeFilePath);
        const gitRepositoryPath = await getGitRepositoryPath(vscode.workspace.rootPath);
        const data = await historyUtil.getFileHistoryBefore(gitRepositoryPath, relativeFilePath, isoStrictDateTime);
        const historyItem: any = data.find(data => data.sha1 === sha1);
        const previousItems = data.filter(data => data.sha1 !== sha1);
        historyItem.previousSha1 = previousItems.length === 0 ? '' : previousItems[0].sha1 as string;
        const item: vscode.QuickPickItem = <vscode.QuickPickItem>{
            label: '',
            description: '',
            data: historyItem,
            isLast: historyItem.previousSha1.length === 0
        };
        onItemSelected(item, fileName, relativeFilePath);
    }
    catch (error) {
        logger.logError(error);
    }
});

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

        vscode.window.showQuickPick(itemPickList, { placeHolder: '', matchOnDescription: true }).then(item => {
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


function onItemSelected(item: vscode.QuickPickItem, fileName: string, relativeFilePath: string) {
    const itemPickList: vscode.QuickPickItem[] = [];
    itemPickList.push({ label: 'View Change Log', description: 'Author, committer and message' });
    itemPickList.push({ label: 'View File Contents', description: '' });
    itemPickList.push({ label: 'Compare against workspace file', description: '' });
    if (!(<any>item).isLast) {
        itemPickList.push({ label: 'Compare against previous version', description: '' });
    }

    vscode.window.showQuickPick(itemPickList, { placeHolder: item.label, matchOnDescription: true }).then(cmd => {
        if (!cmd) {
            return;
        }
        const data = (<any>item).data;
        if (cmd.label === itemPickList[0].label) {
            viewLog(data);
            return;
        }

        if (cmd.label === itemPickList[1].label) {
            viewFile(data, relativeFilePath);
            return;
        }
        if (cmd.label === itemPickList[2].label) {
            launchFileCompareWithLocal(data, fileName, relativeFilePath);
            return;
        }
        if (itemPickList.length > 3 && cmd.label === itemPickList[3].label) {
            launchFileCompareWithPrevious(data, relativeFilePath);
            return;
        }
    });
}

async function viewFile(details: any, relativeFilePath: string) {
    try {
        const tmpFilePath = await getFile(details.sha1, relativeFilePath);
        vscode.workspace.openTextDocument(tmpFilePath).then(document => {
            vscode.window.showTextDocument(document);
        });
    }
    catch (error) {
        logger.logError(error);
    }
}

function viewLog(details: any) {
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

async function launchFileCompareWithLocal(details: any, fileName: string, relativeFilePath: string) {
    try {
        const tmpFilePath = await getFile(details.sha1, relativeFilePath);
        vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(tmpFilePath), vscode.Uri.file(fileName));
    }
    catch (error) {
        logger.logError(error);
    }
}

async function launchFileCompareWithPrevious(details: any, relativeFilePath: string) {
    try {
        const files = await Promise.all([getFile(details.previousSha1, relativeFilePath), getFile(details.sha1, relativeFilePath)]);
        vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(files[0]), vscode.Uri.file(files[1]));
    }
    catch (error) {
        logger.logError(error);
    }
}

async function getFile(commitSha1: string, localFilePath: string): Promise<string> {
    const rootDir = vscode.workspace.rootPath;
    return new Promise<string>((resolve, reject) => {
        let ext = path.extname(localFilePath);
        tmp.file({ postfix: ext }, async function _tempFileCreated(err: any, tmpFilePath: string, fd: number, cleanupCallback: () => void) {
            if (err) {
                reject(err);
                return;
            }
            try {
                const targetFile = await historyUtil.writeFile(rootDir, commitSha1, localFilePath, tmpFilePath);
                resolve(targetFile);
            }
            catch (ex) {
                logger.logError(ex);
                reject(ex);
            }
        });
    });
}