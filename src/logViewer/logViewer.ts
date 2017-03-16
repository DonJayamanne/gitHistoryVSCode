import * as vscode from 'vscode';
// import * as htmlGenerator from './htmlGenerator';
// import * as gitHistory from '../helpers/gitHistory';
// import { LogEntry } from '../contracts';
// import * as path from 'path';
import { Server } from './server';

const gitHistorySchema = 'git-history-viewer';
// const PAGE_SIZE = 50;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved: boolean;
let pageIndex = 0;
// let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private serverPort: number;
    public set ServerPort(value: number) {
        this.serverPort = value;
    }
    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        // try {
        //     const entries = await gitHistory.getLogEntries(vscode.workspace.rootPath, pageIndex, pageSize);
        //     canGoPrevious = pageIndex > 0;
        //     canGoNext = entries.length === pageSize;
        //     this.entries = entries;
        //     let html = this.generateHistoryView();
        //     return html;
        // }
        // catch (error) {
        //     return this.generateErrorView(error);
        // }
        return this.generateResultsView();
    }

    private generateResultsView(): Promise<string> {

        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        let timeNow = new Date().getTime();
        const htmlContent = `
                    <!DOCTYPE html>
                    <head><style type="text/css"> html, body{ height:100%; width:100%; } </style>
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
                            document.getElementById('myframe').src = 'http://localhost:${this.serverPort}/?theme=' + theme + '&color=' + encodeURIComponent(color) + "&backgroundColor=" + encodeURIComponent(backgroundColor) + "&fontFamily=" + encodeURIComponent(fontFamily) + "&fontWeight=" + encodeURIComponent(fontWeight) + "&fontSize=" + encodeURIComponent(fontSize);
                        }
                    </script>
                    </head>
                    <body onload="start()">
                    <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe></body></html>`;
        return Promise.resolve(htmlContent);
    }

    // private getStyleSheetPath(resourceName: string): string {
    //     return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'resources', resourceName)).toString();
    // }
    // private getScriptFilePath(resourceName: string): string {
    //     return vscode.Uri.file(path.join(__dirname, '..', '..', 'src', 'browser', resourceName)).toString();
    // }
    // private getNodeModulesPath(resourceName: string): string {
    //     return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'node_modules', resourceName)).toString();
    // }

    // private generateErrorView(error: string): string {
    //     return `
    //         <head>
    //             <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
    //         </head>
    //         <body>
    //             ${htmlGenerator.generateErrorView(error)}
    //         </body>
    //     `;
    // }

    // private generateHistoryView(): string {
    //     const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
    //     return `
    //         <head>
    //             <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath('hint.min.css')}" >
    //             <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
    //             <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
    //             <script src="${this.getNodeModulesPath(path.join('clipboard', 'dist', 'clipboard.min.js'))}"></script>
    //             <script src="${this.getScriptFilePath('proxy.js')}"></script>
    //             <script src="${this.getScriptFilePath('svgGenerator.js')}"></script>
    //             <script src="${this.getScriptFilePath('detailsView.js')}"></script>
    //         </head>

    //         <body>
    //             ${innerHtml}
    //         </body>
    //     `;
    // }
}

let server: Server;
export function activate(context: vscode.ExtensionContext) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);

    let disposable = vscode.commands.registerCommand('git.viewHistory', () => {
        // Unique name everytime, so that we always refresh the history log
        // Untill we add a refresh button to the view
        server = server || new Server();
        return server.start().then(port => {
            provider.ServerPort = port;
            historyRetrieved = false;
            pageIndex = 0;
            canGoPrevious = false;
            canGoNext = true;
            previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
            return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, 'Git History (git log)').then((success: any) => {
            }, (reason: string) => {
                vscode.window.showErrorMessage(reason);
            });
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('git.copyText', (sha: string) => {
        vscode.window.showInformationMessage(sha);
    });
    context.subscriptions.push(disposable);

    // TODO: Use socket.io to send/receive data
    // disposable = vscode.commands.registerCommand('git.logNavigate', (direction: string) => {
    //     pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
    //     provider.update(previewUri);
    // });

    context.subscriptions.push(disposable);
}