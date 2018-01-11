// import * as vscode from 'vscode';
// import * as historyUtil from '../helpers/historyUtils';
// // tslint:disable-next-line:ordered-imports
// import * as gitPaths from '../helpers/gitPaths';
// import * as path from 'path';
// import * as logger from '../logger';

// export function activate(context: vscode.ExtensionContext) {
//     const disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
//         run();
//     });
//     context.subscriptions.push(disposable);
// }

// // tslint:disable-next-line:no-any
// export async function run(): Promise<any> {
//     try {
//         if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
//             return;
//         }
//         if (!vscode.window.activeTextEditor.selection) {
//             return;
//         }

//         const gitRepositoryPath = await gitPaths.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName);
//         const relativeFilePath = path.relative(gitRepositoryPath, vscode.window.activeTextEditor.document.fileName);
//         const currentLineNumber = vscode.window.activeTextEditor.selection.start.line + 1;
//         // tslint:disable-next-line:no-any
//         const log: any[] = await historyUtil.getLineHistory(gitRepositoryPath, relativeFilePath, currentLineNumber);
//         if (log.length === 0) {
//             vscode.window.showInformationMessage(`There are no history items for this item '${relativeFilePath}'.`);
//             return;
//         }

//         const itemPickList: vscode.QuickPickItem[] = log.map(item => {
//             const dateTime = new Date(Date.parse(item.author_date)).toLocaleString();
//             const label = `${item.author_name} <${item.author_email}> on ${dateTime}`;
//             const description = item.message;
//             return { label: label, description: description, data: item };
//         });

//         vscode.window.showQuickPick(itemPickList, { placeHolder: 'Select an item to view the change log', matchOnDescription: true }).then(item => {
//             if (!item) {
//                 return;
//             }
//             onItemSelected(item);
//         });
//     }
//     catch (error) {
//         logger.logError(error);
//     }
// }

// function onItemSelected(item: vscode.QuickPickItem) {
//     // tslint:disable-next-line:no-any
//     viewLog((<any>item).data);
// }

// // tslint:disable-next-line:no-any
// function viewLog(details: any) {
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
