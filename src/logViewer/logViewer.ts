import { decode as htmlDecode } from 'he';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fileHistory from '../commands/fileHistory';
import * as gitCherryPick from '../helpers/gitCherryPick';
import * as gitPaths from '../helpers/gitPaths';
import * as historyUtil from '../helpers/historyUtils';
import * as logger from '../logger';
import { Server } from './server';

const gitHistorySchema = 'git-history-viewer';
let previewUri = vscode.Uri.parse(`${gitHistorySchema}://authority/git-history`);
let pageIndex = 0;
let canGoPrevious = false;
let canGoNext = true;
let gitRepoPath = vscode.workspace.rootPath;
let historyRetrieved: boolean;

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private serverPort: number;
    public set ServerPort(value: number) {
        this.serverPort = value;
    }
    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        return this.generateResultsView();
    }

    private generateResultsView(): Promise<string> {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        const timeNow = new Date().getTime();
        const htmlContent = `
                    <!DOCTYPE html>
                    <head><style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; } </style>
                    <script type="text/javascript">
                        function start(){
                            console.log('reloaded results window at time ${timeNow}ms');
                            var color = '';
                            var fontFamily = '';
                            var fontSize = '';
                            var theme = '';
                            var fontWeight = '';
                            try {
                                computedStyle = window.getComputedStyle(document.body);
                                color = computedStyle.color + '';
                                backgroundColor = computedStyle.backgroundColor + '';
                                fontFamily = computedStyle.fontFamily;
                                fontSize = computedStyle.fontSize;
                                fontWeight = computedStyle.fontWeight;
                                theme = document.body.className;
                            }
                            catch(ex){
                            }
                            document.getElementById('myframe').src = 'http://localhost:${this.serverPort}/?_=${timeNow}&id=DEFAULT&theme=' + theme + '&color=' + encodeURIComponent(color) + "&backgroundColor=" + encodeURIComponent(backgroundColor) + "&fontFamily=" + encodeURIComponent(fontFamily) + "&fontWeight=" + encodeURIComponent(fontWeight) + "&fontSize=" + encodeURIComponent(fontSize);
                        }
                    </script>
                    </head>
                    <body onload="start()">
                    <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe></body></html>`;
        return Promise.resolve(htmlContent);
    }
}

let server: Server;
// tslint:disable-next-line:max-func-body-length
export async function activate(context: vscode.ExtensionContext) {
    const provider = new TextDocumentContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);

    let disposable = vscode.commands.registerCommand('git.viewHistory', async () => {
        const itemPickList: vscode.QuickPickItem[] = [];
        itemPickList.push({ label: 'Current branch', description: '' });
        itemPickList.push({ label: 'All branches', description: '' });
        const modeChoice = await vscode.window.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });

        let title = 'Git History (All Branches)';
        if (modeChoice === undefined) {
            return;
        }

        let fileName = '';
        let branchName = 'master';

        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
            fileName = vscode.window.activeTextEditor.document.fileName;
        }
        if (fileName !== '') {
            gitRepoPath = await gitPaths.getGitRepositoryPath(fileName);
        }
        else {
            gitRepoPath = vscode.workspace.rootPath;
        }

        branchName = await gitPaths.getGitBranch(gitRepoPath!);

        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;

        if (modeChoice.label === 'All branches') {
            previewUri = vscode.Uri.parse(`${gitHistorySchema}://authority/git-history`);
            title = 'Git History (all branches)';
        }
        else {
            previewUri = vscode.Uri.parse(`${gitHistorySchema}://authority/git-history?branch=${encodeURI(branchName)}`);
            title = `Git History (${branchName})`;
        }

        // Unique name everytime, so that we always refresh the history log
        // Untill we add a refresh button to the view
        server = server || new Server();
        return server.start().then(port => {
            provider.ServerPort = port;
            historyRetrieved = false;
            pageIndex = 0;
            canGoPrevious = false;
            canGoNext = true;
            previewUri = vscode.Uri.parse(`${gitHistorySchema}://authority/git-history`);
            // tslint:disable-next-line:no-any no-empty
            return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, 'Git History (git log)').then((success: any) => {
            }, (reason: string) => {
                vscode.window.showErrorMessage(reason);
            });
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('git.cherry-pick-into', (branch: string, hash: string) => {
        gitCherryPick.CherryPick(vscode.workspace.rootPath!, branch, hash).then((value) => {
            vscode.window.showInformationMessage(`Cherry picked into ${value.branch} (${value.hash})`);
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable);

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('git.viewFileCommitDetails', async (hash: string, relativeFilePath: string, isoStrictDateTime: string) => {
        try {
            relativeFilePath = htmlDecode(relativeFilePath);
            const fileName = path.join(gitRepoPath!, relativeFilePath);
            const data = await historyUtil.getFileHistoryBefore(gitRepoPath!, relativeFilePath, isoStrictDateTime);
            // tslint:disable-next-line:possible-timing-attack o-shadowed-variable no-any
            const historyItem: any = data.find(dataItem => dataItem.hash === hash);
            // tslint:disable-next-line:possible-timing-attack
            const previousItems = data.filter(dataItem => dataItem.hash !== hash);
            historyItem.previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
            const item: vscode.QuickPickItem = <vscode.QuickPickItem>{
                label: '',
                description: '',
                data: historyItem,
                isLast: historyItem.previousHash.length === 0
            };
            fileHistory.onItemSelected(item, fileName, relativeFilePath);
        }
        catch (error) {
            logger.logError(error);
        }
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('git.viewFileCommitDetails', async (hash: string, relativeFilePath: string, isoStrictDateTime: string) => {
        try {
            relativeFilePath = htmlDecode(relativeFilePath);
            const fileName = path.join(gitRepoPath!, relativeFilePath);
            const data = await historyUtil.getFileHistoryBefore(gitRepoPath!, relativeFilePath, isoStrictDateTime);
            // tslint:disable-next-line:no-shadowed-variable no-any possible-timing-attack
            const historyItem: any = data.find(dataItem => dataItem.hash === hash);
            // tslint:disable-next-line:no-shadowed-variable no-any possible-timing-attack
            const previousItems = data.filter(dataItem => dataItem.hash !== hash);
            historyItem.previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
            const item: vscode.QuickPickItem = <vscode.QuickPickItem>{
                label: '',
                description: '',
                data: historyItem,
                isLast: historyItem.previousHash.length === 0
            };
            fileHistory.onItemSelected(item, fileName, relativeFilePath);
        }
        catch (error) {
            logger.logError(error);
        }
    });

    context.subscriptions.push(disposable);
}
export function getGitRepoPath() {
    return gitRepoPath!;
}
