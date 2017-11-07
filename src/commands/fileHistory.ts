import { inject, injectable } from 'inversify';
import * as path from 'path';
import { commands, Uri, ViewColumn, window, workspace } from 'vscode';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import { IServerHost } from '../server/types';
import { CommittedFile, IGitServiceFactory } from '../types';
import { IGitFileHistoryCommandHandler } from './types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler {
    constructor( @inject(IServerHost) private server: IServerHost,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IUiService) private uiService: IUiService
        // @inject(IWorkspaceQueryStateStore) private stateStore: IWorkspaceQueryStateStore
    ) {
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
    }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async onFileSelected(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const commandName = await this.uiService.selectFileCommitCommandAction(commitedFile);
        if (!commandName) {
            return;
        }
        await commands.executeCommand(commandName, workspaceFolder, branch, hash, commitedFile);
    }

    @command('git.commit.file.viewFileContents', IGitFileHistoryCommandHandler)
    public async onViewFile(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.gitServiceFactory.createGitService(workspaceFolder);
        const tmpFile = await gitService.getCommitFile(hash, commitedFile.uri);
        const doc = await workspace.openTextDocument(tmpFile as Uri);
        await window.showTextDocument(doc, ViewColumn.Two, false);
    }

    @command('git.commit.file.compareAgainstWorkspace', IGitFileHistoryCommandHandler)
    public async onCompareFileWithWorkspace(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.gitServiceFactory.createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        const tmpFile = await gitService.getCommitFile(hash, commitedFile.uri);
        const fileName = path.basename(commitedFile.uri.fsPath);
        const title = `${fileName} (${logEntry!.hash.short}) ↔ ${fileName} (workspace)`;
        await commands.executeCommand('vscode.diff', tmpFile as Uri, commitedFile.uri, title);
    }

    @command('git.commit.file.compareAgainstPrevious', IGitFileHistoryCommandHandler)
    public async onCompareFileWithPrevious(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.gitServiceFactory.createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        const tmpFile = await gitService.getCommitFile(hash, commitedFile.uri);
        const previousCommit = await gitService.getPreviousCommitHashForFile(hash, commitedFile.uri);
        const previousFile = commitedFile.oldUri ? commitedFile.oldUri : commitedFile.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommit.full, previousFile);
        const title = `${path.basename(commitedFile.uri.fsPath)} (${logEntry!.hash.short}) ↔ ${path.basename(previousFile.fsPath)} (${previousCommit.short})`;
        await commands.executeCommand('vscode.diff', tmpFile as Uri, previousTmpFile, title);
    }

    // @command('git.commit.file.viewChangeLog', IGitFileHistoryCommandHandler)
    // public async onViewFileHistoryChangeLog(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
    //     const gitService = await this.gitServiceFactory.createGitService(workspaceFolder);
    //     const branchName = await gitService.getCurrentBranch();
    //     const command = await this.uiFileHistoryPicker.selectCommandAction(gitService, branchName, hash, commitedFile);
    //     if (!command) {
    //         return;
    //     }
    //     await commands.executeCommand(workspaceFolder, branch, hash, commitedFile);
    // }
}

// import * as fs from 'fs';
// import { decode as htmlDecode } from 'he';
// import * as path from 'path';
// import * as tmp from 'tmp';
// import * as vscode from 'vscode';
// import { formatDate } from '../common/helpers';
// import { getGitRepositoryPath } from '../helpers/gitPaths';
// import * as historyUtil from '../helpers/historyUtils';
// import { CommitInfo } from '../helpers/logParser';
// import * as logger from '../logger';

// export function activate(context: vscode.ExtensionContext) {
//     const disposable = vscode.commands.registerCommand('git.viewFileHistory', (fileUri?: vscode.Uri) => {
//         let fileName = '';
//         if (fileUri && fileUri.fsPath) {
//             fileName = fileUri.fsPath;
//         }
//         else {
//             if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
//                 return;
//             }
//             fileName = vscode.window.activeTextEditor.document.fileName;
//         }
//         run(fileName);
//     });
//     context.subscriptions.push(disposable);
// }

// vscode.commands.registerCommand('git.viewFileCommitDetails', async (hash: string, relativeFilePath: string, isoStrictDateTime: string) => {
//     try {
//         relativeFilePath = htmlDecode(relativeFilePath);
//         const fileName = path.join(vscode.workspace.rootPath!, relativeFilePath);
//         const gitRepositoryPath = await getGitRepositoryPath(vscode.workspace.rootPath!);
//         const data = await historyUtil.getFileHistoryBefore(gitRepositoryPath, relativeFilePath, isoStrictDateTime);
//         // tslint:disable-next-line:possible-timing-attack
//         const historyItem = data.find(item => item.hash === hash);
//         // tslint:disable-next-line:possible-timing-attack
//         const previousItems = data.filter(item => item.hash !== hash);
//         // tslint:disable-next-line:no-any prefer-type-cast
//         (historyItem as any).previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
//         const commitItem: vscode.QuickPickItem = <vscode.QuickPickItem>{
//             label: '',
//             description: '',
//             data: historyItem,
//             // tslint:disable-next-line:no-any prefer-type-cast
//             isLast: (historyItem as any).previousHash.length === 0
//         };
//         onItemSelected(commitItem, fileName, relativeFilePath);
//     }
//     catch (error) {
//         logger.logError(error);
//     }
// });

// export async function run(fileName: string) {
//     try {
//         const gitRepositoryPath = await getGitRepositoryPath(fileName);
//         const relativeFilePath = path.relative(gitRepositoryPath, fileName);
//         const fileHistory = await historyUtil.getFileHistory(gitRepositoryPath, relativeFilePath);

//         if (fileHistory.length === 0) {
//             vscode.window.showInformationMessage(`There are no history items for this item '${relativeFilePath}'.`);
//             return;
//         }

//         const itemPickList: vscode.QuickPickItem[] = fileHistory.map(item => {
//             const dateTime = formatDate(new Date(Date.parse(item.author_date)));
//             // tslint:disable-next-line:no-backbone-get-set-outside-model
//             let label = <string>vscode.workspace.getConfiguration('gitHistory').get('displayLabel');
//             // tslint:disable-next-line:no-backbone-get-set-outside-model
//             let description = <string>vscode.workspace.getConfiguration('gitHistory').get('displayDescription');
//             // tslint:disable-next-line:no-backbone-get-set-outside-model
//             let detail = <string>vscode.workspace.getConfiguration('gitHistory').get('displayDetail');

//             const firstLineofMessage = item.message.split('\n')[0];

//             // tslint:disable-next-line:no-invalid-template-strings
//             label = label.replace('${date}', dateTime).replace('${name}', item.author_name)
//                 // tslint:disable-next-line:no-invalid-template-strings
//                 .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);
//             // tslint:disable-next-line:no-invalid-template-strings
//             description = description.replace('${date}', dateTime).replace('${name}', item.author_name)
//                 // tslint:disable-next-line:no-invalid-template-strings
//                 .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);
//             // tslint:disable-next-line:no-invalid-template-strings
//             detail = detail.replace('${date}', dateTime).replace('${name}', item.author_name)
//                 // tslint:disable-next-line:no-invalid-template-strings
//                 .replace('${email}', item.author_email).replace('${message}', firstLineofMessage);

//             return { label: label, description: description, detail: detail, data: item };
//         });

//         itemPickList.forEach((item, index) => {
//             if (index === (itemPickList.length - 1)) {
//                 // tslint:disable-next-line:no-any
//                 (<any>item).isLast = true;
//             }
//             else {
//                 // tslint:disable-next-line:no-any
//                 (<any>item).data.previousHash = fileHistory[index + 1].hash;
//             }
//         });

//         vscode.window.showQuickPick(itemPickList, { placeHolder: '', matchOnDescription: true, matchOnDetail: true }).then(item => {
//             if (!item) {
//                 return;
//             }
//             onItemSelected(item, fileName, relativeFilePath);
//         });
//     }
//     catch (error) {
//         logger.logError(error);
//     }
// }

// export async function getFileCommitHistory(hash: string, relativeFilePath: string, isoStrictDateTime: string, gitGitRepositoryPath: string): Promise<CommitInfo & { previousHash: string } | undefined> {
//     // const fileName = path.join(gitGitRepositoryPath, relativeFilePath);
//     const data = await historyUtil.getFileHistoryBefore(gitGitRepositoryPath, relativeFilePath, isoStrictDateTime);
//     // tslint:disable-next-line:possible-timing-attack
//     const historyItem = data.find(item => item.hash === hash);
//     if (!historyItem) {
//         return;
//     }
//     // tslint:disable-next-line:possible-timing-attack
//     const previousItems = data.filter(item => item.hash !== hash);
//     const previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
//     return {
//         ...historyItem!,
//         previousHash
//     };
// }
// export async function onItemSelected(item: vscode.QuickPickItem, fileName: string, relativeFilePath: string) {
//     // tslint:disable-next-line:no-any
//     const commit = (<any>item).data;
//     const gitRepositoryPath = await getGitRepositoryPath(fileName);
//     const getThisFile = getFile(commit.hash, gitRepositoryPath, relativeFilePath);
//     const getPreviousFile = getFile(commit.previousHash, gitRepositoryPath, relativeFilePath);

//     const thisFile = await getThisFile;
//     const previousFile = await getPreviousFile;

//     const itemPickList: vscode.QuickPickItem[] = [];
//     itemPickList.push({ label: 'View Change Log', description: 'Author, committer and message' });
//     if (thisFile.length > 0) {
//         itemPickList.push({ label: 'View File Contents', description: '' });
//     }
//     if (thisFile.length > 0 && fs.existsSync(fileName)) {
//         itemPickList.push({ label: 'Compare against workspace file', description: '' });
//     }
//     if (previousFile.length > 0 && thisFile.length > 0) {
//         itemPickList.push({ label: 'Compare against previous version', description: '' });
//     }

//     vscode.window.showQuickPick(itemPickList, { placeHolder: item.label, matchOnDescription: true }).then(cmd => {
//         if (!cmd) {
//             return;
//         }
//         // tslint:disable-next-line:no-any
//         const data = (<any>item).data;
//         if (cmd.label === 'View Change Log') {
//             viewLog(data);
//             return;
//         }
//         if (cmd.label === 'View File Contents') {
//             viewFile(thisFile);
//             return;
//         }
//         if (cmd.label === 'Compare against workspace file') {
//             diffFiles(fileName, thisFile, commit.hash, fileName, '');
//             return;
//         }
//         if (cmd.label === 'Compare against previous version') {
//             diffFiles(fileName, previousFile, commit.previousHash, thisFile, commit.hash);
//             return;
//         }
//     });
// }

// export async function viewFile(fileName: string) {
//     try {
//         vscode.workspace.openTextDocument(fileName).then(document => {
//             vscode.window.showTextDocument(document);
//         });
//     }
//     catch (error) {
//         logger.logError(error);
//     }
// }

// export function viewLog(details: CommitInfo) {
//     const authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
//     const committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
//     // tslint:disable-next-line:prefer-template
//     const log = `Hash : ${details.hash}\n` +
//         `Author : ${details.author_name} <${details.author_email}>\n` +
//         `Author Date : ${authorDate}\n` +
//         `Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
//         `Commit Date : ${committerDate}\n` +
//         `Message : ${details.message}`;

//     logger.showInfo(log);
// }

// export function diffFiles(fileName: string, sourceFile: string, sourceHash: string, destinationFile: string, destinationHash: string) {
//     try {
//         const sourceFormattedHash = `(${sourceHash.substring(0, 7)})`;
//         const destinationFormattedHash = destinationHash !== '' ? `(${destinationHash.substring(0, 7)})` : '';
//         vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(sourceFile), vscode.Uri.file(destinationFile),
//             `${path.basename(fileName)} ${sourceFormattedHash} ↔ ${path.basename(fileName)} ${destinationFormattedHash}`);
//     }
//     catch (error) {
//         logger.logError(error);
//     }
// }

// export async function getFile(commitHash: string, gitRepositoryPath: string, localFilePath: string): Promise<string> {
//     return new Promise<string>((resolve, reject) => {
//         if (commitHash === undefined) {
//             resolve('');
//             return;
//         }
//         const ext = path.extname(localFilePath);
//         // tslint:disable-next-line:no-any
//         tmp.file({ postfix: ext }, async (err: any, tmpFilePath: string, fd: number, cleanupCallback: () => void) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             try {
//                 const targetFile = await historyUtil.writeFile(gitRepositoryPath, commitHash, localFilePath, tmpFilePath);
//                 resolve(targetFile);
//             }
//             catch (ex) {
//                 logger.logError(ex);
//                 reject(ex);
//             }
//         });
//     });
// }
