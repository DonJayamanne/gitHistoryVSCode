import * as vscode from 'vscode';
import * as historyUtil from '../helpers/historyUtils';
import * as path from 'path';
import * as tmp from 'tmp';

// TODO:Clean up this mess

let outChannel: vscode.OutputChannel;
const tmpFileCleanup = new Map<string, Function>();

export function activate(outputChannel: vscode.OutputChannel) {
    outChannel = outputChannel;
}

vscode.workspace.onDidCloseTextDocument(textDocument => {
    if (textDocument && tmpFileCleanup.has(textDocument.fileName)) {
        let cleanupFunction = tmpFileCleanup.get(textDocument.fileName);
        if (cleanupFunction !== undefined) {
            try {
                cleanupFunction();
            }
            catch (ex) {
            }
            tmpFileCleanup.delete(textDocument.fileName);
        }
    }
});

vscode.commands.registerCommand('git.viewFileCommitDetails', (sha1: string, relativeFilePath: string, isoStrictDateTime: string) => {
    const fileName = path.join(vscode.workspace.rootPath, relativeFilePath);
    historyUtil.getGitRepositoryPath(vscode.workspace.rootPath).then(
        (gitRepositoryPath) => {
            historyUtil.getFileHistoryBefore(gitRepositoryPath, relativeFilePath, sha1, isoStrictDateTime).then((data: any[]) => {
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
            }, ex => {
                vscode.window.showErrorMessage(`There was an error in retrieving the file history. (${ex.message ? ex.message : ex + ''})`);
            });
   }).then(() => { }, error => genericErrorHandler(error));
});

export function run(fileName: string): any {
    historyUtil.getGitRepositoryPath(fileName).then(
        (gitRepositoryPath) => {
            let relativeFilePath = path.relative(gitRepositoryPath, fileName);

            historyUtil.getFileHistory(gitRepositoryPath, relativeFilePath).then(displayHistory, genericErrorHandler);

            function displayHistory(log: any[]) {
                if (log.length === 0) {
                    vscode.window.showInformationMessage(`There are no history items for this item '${relativeFilePath}'.`);
                    return;
                }

                let itemPickList: vscode.QuickPickItem[] = log.map(item => {
                    let dateTime = new Date(Date.parse(item.author_date)).toLocaleString();

                    let label = <string>vscode.workspace.getConfiguration('gitHistory').get('displayLabel'),
                        description = <string>vscode.workspace.getConfiguration('gitHistory').get('displayDescription');

                    label = label.replace('${date}', dateTime).replace('${name}', item.author_name)
                        .replace('${email}', item.author_email).replace('${message}', item.message);
                    description = description.replace('${date}', dateTime).replace('${name}', item.author_name)
                        .replace('${email}', item.author_email).replace('${message}', item.message);

                    return { label: label, description: description, data: item };
                });

                itemPickList.forEach((item, index) => {
                    if (index === (itemPickList.length - 1)) {
                        (<any>item).isLast = true;
                    }
                    else {
                        (<any>item).data.previousSha1 = log[index + 1].sha1;
                    }
                });

                vscode.window.showQuickPick(itemPickList, { placeHolder: '', matchOnDescription: true }).then(item => {
                    if (!item) {
                        return;
                    }
                    onItemSelected(item, fileName, relativeFilePath);
                });
            }
        }).then(() => { }, error => genericErrorHandler(error));
}

function onItemSelected(item: vscode.QuickPickItem, fileName: string, relativeFilePath: string) {
    let itemPickList: vscode.QuickPickItem[] = [];
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
        let data = (<any>item).data;
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

function viewFile(details: any, relativeFilePath: string) {
    displayFile(details.sha1, relativeFilePath).then(() => { }, genericErrorHandler);
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

    outChannel.append(log);
    outChannel.show();
}

function launchFileCompareWithLocal(details: any, fileName: string, relativeFilePath: string) {
    compareFileWithLocalCopy(details.sha1, fileName, relativeFilePath).then(() => { }, genericErrorHandler);
}

function launchFileCompareWithPrevious(details: any, relativeFilePath: string) {
    Promise.all<string>([getFile(details.previousSha1, relativeFilePath), getFile(details.sha1, relativeFilePath)]).then(files => {
        return vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(files[0]), vscode.Uri.file(files[1]));
    }).catch(genericErrorHandler);
}

function genericErrorHandler(error: any) {
    if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git') {
        vscode.window.showErrorMessage('Cannot find the git installation');
    } else {
        outChannel.appendLine(error);
        outChannel.show();
        vscode.window.showErrorMessage('There was an error, please view details in output log');
    }
}

function getFile(commitSha1: string, localFilePath: string): Thenable<string> {
    let rootDir = vscode.workspace.rootPath;
    return new Promise((resolve, reject) => {
        let ext = path.extname(localFilePath);
        tmp.file({ postfix: ext }, function _tempFileCreated(err: any, tmpFilePath: string, fd: number, cleanupCallback: () => void) {
            if (err) {
                reject(err);
                return;
            }
            historyUtil.writeFile(rootDir, commitSha1, localFilePath, tmpFilePath).then(() => {
                // Windows drive letter hack
                // vscode returns lowercase drive letter for textDocument.fileName when calling onDidCloseTextDocument
                // If we dont do this we wont get a filename match for cleanup
                if (tmpFilePath.indexOf(':') === 1) {
                    tmpFilePath = tmpFilePath.substr(0, 1).toLowerCase() + tmpFilePath.substr(1);
                }
                tmpFileCleanup.set(tmpFilePath, cleanupCallback);
                resolve(tmpFilePath);
            }, reject);
        });
    });
}

function displayFile(commitSha1: string, localFilePath: string): Thenable<string> {
    return new Promise((resolve, reject) => {
        getFile(commitSha1, localFilePath).then((tmpFilePath) => {
            vscode.workspace.openTextDocument(tmpFilePath).then(d => {
                vscode.window.showTextDocument(d);
                resolve(tmpFilePath);
            });

        }, reject);
    });
}

function compareFileWithLocalCopy(commitSha1: string, localFilePath: string, relativeFilePath: string): Thenable<string> {
    return getFile(commitSha1, relativeFilePath).then((tmpFilePath) => {
        return vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(tmpFilePath), vscode.Uri.file(localFilePath));
    });
}
