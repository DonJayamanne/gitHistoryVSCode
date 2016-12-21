import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as gitHistory from '../helpers/gitHistory';
import { LogEntry } from '../contracts';
import * as path from 'path';

const gitHistorySchema = 'git-history-viewer';
const PAGE_SIZE = 50;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved: boolean;
let pageIndex = 0;
let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private entries: LogEntry[];

    public async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        try {
            const entries = await gitHistory.getLogEntries(vscode.workspace.rootPath, pageIndex, pageSize);
            canGoPrevious = pageIndex > 0;
            canGoNext = entries.length === pageSize;
            this.entries = entries;
            let html = this.generateHistoryView();
            return html;
        }
        catch (error) {
            return this.generateErrorView(error);
        }
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private getStyleSheetPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'resources', resourceName)).toString();
    }
    private getScriptFilePath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'src', 'browser', resourceName)).toString();
    }
    private getNodeModulesPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'node_modules', resourceName)).toString();
    }

    private generateErrorView(error: string): string {
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                ${htmlGenerator.generateErrorView(error)}
            </body>
        `;
    }

    private generateHistoryView(): string {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('hint.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery','dist','jquery.min.js'))}"></script>
                <script src="${this.getNodeModulesPath(path.join('clipboard','dist','clipboard.min.js'))}"></script>
                <script src="${this.getScriptFilePath('proxy.js')}"></script>
                <script src="${this.getScriptFilePath('svgGenerator.js')}"></script>
                <script src="${this.getScriptFilePath('detailsView.js')}"></script>
            </head>

            <body>
                ${innerHtml}
            </body>
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);

    let disposable = vscode.commands.registerCommand('git.viewHistory', () => {
        // Unique name everytime, so that we always refresh the history log
        // Untill we add a refresh button to the view
        historyRetrieved = false;
        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;
        previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, 'Git History (git log)').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('git.copyText', (sha: string) => {
        vscode.window.showInformationMessage(sha);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('git.logNavigate', (direction: string) => {
        pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
        provider.update(previewUri);
    });

    context.subscriptions.push(disposable);
}