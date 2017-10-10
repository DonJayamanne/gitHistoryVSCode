// import { decode as htmlDecode } from 'he';
import { inject, injectable } from 'inversify';
import * as querystring from 'query-string';
import { Disposable } from 'vscode';
import * as vscode from 'vscode';
import { command } from '../commands/register';
import { BranchSelection, IUiService } from '../common/types';
import { IGitServiceFactory } from '../types';
import { Server } from './server';
import { ILogViewer, IThemeService } from './types';

const gitHistorySchema = 'git-history-viewer';
const previewUri = vscode.Uri.parse(`${gitHistorySchema}://authority/git-history`);

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        const query = querystring.parse(uri.toString())!;
        const port: number = parseInt(query.port!.toString(), 10);
        const id: string = query.id! as string;
        const branchName: string = query.branchName! as string;
        return this.generateResultsView(port, id, branchName);
    }

    private generateResultsView(port: number, id: string, branchName: string): Promise<string> {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        const timeNow = '';  // new Date().getTime();
        const htmlContent = `
                    <!DOCTYPE html>
                    <head><style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; } </style>
                    <script type="text/javascript">
                        function start(){
                            // We need a unique value so html is reloaded
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
                            var queryArgs = [
                                            'id=${id}',
                                            'branchName=${encodeURIComponent(branchName)}',
                                            'theme=' + theme,
                                            'color=' + encodeURIComponent(color),
                                            'backgroundColor=' + encodeURIComponent(backgroundColor),
                                            'fontFamily=' + encodeURIComponent(fontFamily),
                                            'fontWeight=' + encodeURIComponent(fontWeight),
                                            'fontSize=' + encodeURIComponent(fontSize)
                                        ];
                            document.getElementById('myframe').src = 'http://localhost:${port}/?_=${timeNow}&' + queryArgs.join('&');
                        }
                    </script>
                    </head>
                    <body onload="start()">
                    <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe>
                    </body></html>`;
        return Promise.resolve(htmlContent);
    }
}

@injectable()
export class LogViewer implements ILogViewer {
    private disposables: Disposable[] = [];
    private server: Server | undefined;
    private readonly gitServiceFactory: IGitServiceFactory;
    private readonly uiService: IUiService;
    private readonly themeService: IThemeService;
    constructor( @inject(IGitServiceFactory) gitServiceFactory: IGitServiceFactory,
        @inject(IUiService) uiService: IUiService,
        @inject(IThemeService) themeService: IThemeService) {

        this.gitServiceFactory = gitServiceFactory;
        this.uiService = uiService;
        this.themeService = themeService;

        const provider = new TextDocumentContentProvider();
        const registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
        this.disposables.push(registration);
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        if (this.server) {
            this.server.dispose();
            this.server = undefined;
        }
    }

    private createServer() {
        return this.server || new Server(this.themeService, this.gitServiceFactory);
    }
    @command('git.viewHistory', ILogViewer)
    public async viewHistory() {
        const workspacefolder = await this.uiService.getWorkspaceFolder();
        if (!workspacefolder) {
            return undefined;
        }
        const branchSelection = await this.uiService.getBranchSelection();
        if (!branchSelection) {
            return;
        }
        const gitService = await this.gitServiceFactory.createGitService(workspacefolder);
        const branchName = await gitService.getCurrentBranch();
        const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        const server = await this.createServer();
        const portAndId = await server.start(workspacefolder);
        const uri = `${previewUri}?_=${new Date().getTime()}&id=${portAndId.id}&port=${portAndId.port}&branchName=${branchName}`;
        return vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.One, title);
    }
}

// let server: Server;
// // tslint:disable-next-line:max-func-body-length
// export async function activate(context: vscode.ExtensionContext) {
//     const provider = new TextDocumentContentProvider();
//     const registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
//     const uiService: IUiService = new UiService();
//     const gitRepository: IGit;
//     let disposable = vscode.commands.registerCommand('git.viewHistory', async () => {
//         const branchSelection = await uiService.getBranchSelection();
//         if (!branchSelection) {
//             return;
//         }

//         const branchName = await gitRepository.getCurrentBranch();
//         const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;

//         // Unique name everytime, so that we always refresh the history log
//         // Untill we add a refresh button to the view
//         server = server || new Server(new ThemeService());
//         return server.start().then(port => {
//             const uri = `${previewUri}?id=${new Date().getTime()}&port=${port}&branchName=${branchName}`;
//             return vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.One, title);
//         }).catch(reason => {
//             vscode.window.showErrorMessage(reason);
//         });
//     });
//     context.subscriptions.push(disposable, registration);

//     disposable = vscode.commands.registerCommand('git.cherry-pick-into', (branch: string, hash: string) => {
//         gitCherryPick.CherryPick(vscode.workspace.rootPath!, branch, hash).then((value) => {
//             vscode.window.showInformationMessage(`Cherry picked into ${value.branch} (${value.hash})`);
//         }, (reason) => {
//             vscode.window.showErrorMessage(reason);
//         });
//     });
//     context.subscriptions.push(disposable);

//     context.subscriptions.push(disposable);

//     disposable = vscode.commands.registerCommand('git.viewFileCommitDetails', async (hash: string, relativeFilePath: string, isoStrictDateTime: string) => {
//         try {
//             relativeFilePath = htmlDecode(relativeFilePath);
//             const fileName = path.join(gitRepoPath!, relativeFilePath);
//             const data = await historyUtil.getFileHistoryBefore(gitRepoPath!, relativeFilePath, isoStrictDateTime);
//             // tslint:disable-next-line:possible-timing-attack o-shadowed-variable no-any
//             const historyItem: any = data.find(dataItem => dataItem.hash === hash);
//             // tslint:disable-next-line:possible-timing-attack
//             const previousItems = data.filter(dataItem => dataItem.hash !== hash);
//             historyItem.previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
//             const item: vscode.QuickPickItem = <vscode.QuickPickItem>{
//                 label: '',
//                 description: '',
//                 data: historyItem,
//                 isLast: historyItem.previousHash.length === 0
//             };
//             fileHistory.onItemSelected(item, fileName, relativeFilePath);
//         }
//         catch (error) {
//             logger.logError(error);
//         }
//     });

//     context.subscriptions.push(disposable);

//     disposable = vscode.commands.registerCommand('git.viewFileCommitDetails', async (hash: string, relativeFilePath: string, isoStrictDateTime: string) => {
//         try {
//             relativeFilePath = htmlDecode(relativeFilePath);
//             const fileName = path.join(gitRepoPath!, relativeFilePath);
//             const data = await historyUtil.getFileHistoryBefore(gitRepoPath!, relativeFilePath, isoStrictDateTime);
//             // tslint:disable-next-line:no-shadowed-variable no-any possible-timing-attack
//             const historyItem: any = data.find(dataItem => dataItem.hash === hash);
//             // tslint:disable-next-line:no-shadowed-variable no-any possible-timing-attack
//             const previousItems = data.filter(dataItem => dataItem.hash !== hash);
//             historyItem.previousHash = previousItems.length === 0 ? '' : previousItems[0].hash;
//             const item: vscode.QuickPickItem = <vscode.QuickPickItem>{
//                 label: '',
//                 description: '',
//                 data: historyItem,
//                 isLast: historyItem.previousHash.length === 0
//             };
//             fileHistory.onItemSelected(item, fileName, relativeFilePath);
//         }
//         catch (error) {
//             logger.logError(error);
//         }
//     });

//     context.subscriptions.push(disposable);
// }
// export function getGitRepoPath() {
//     return gitRepoPath!;
// }
