'use strict';

import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as fs from 'fs';
import * as gitHist from '../helpers/gitHistory';
import * as parser from'../logParser';
import {ActionedDetails, LogEntry, Sha1} from '../contracts';
import * as htmlResources from './htmlResources';

const gitHistorySchema = 'git-history-viewer';

let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved: boolean;
let pageIndex = 0;
let pageSize = 500;
let canGoPrevious = false;
let canGoNext = true;

enum ViewStatus {
    Unknown,
    Loading,
    Idle,
    Error
}
let currentStatus: ViewStatus = ViewStatus.Unknown;


class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private lastError: any;
    private lastUri: vscode.Uri;
    private entries: LogEntry[];

    public provideTextDocumentContent(uri: vscode.Uri): string {
        if (!historyRetrieved) {
            historyRetrieved = true;
            currentStatus = ViewStatus.Loading;
            let that = this;
            gitHist.getHistory(vscode.workspace.rootPath, pageIndex, pageSize).then(entries => {
                canGoPrevious = pageIndex > 0;
                canGoNext = entries.length === pageSize;

                currentStatus = ViewStatus.Idle;
                this.entries = entries;
                this.lastError = null;
                previewUri = vscode.Uri.parse(gitHistorySchema + '://authorityx/git-history' + new Date().getTime().toString());
                that.update(previewUri);
            }).catch(error => {
                currentStatus = ViewStatus.Error;
                this.lastError = error;
                previewUri = vscode.Uri.parse(gitHistorySchema + '://authorityx/git-history' + new Date().getTime().toString());
                this.update(uri);
            });
        }

        return this.createHistoryView();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private createHistoryView(): string {
        if (this.lastError) {
            this.lastError = null;
            return htmlGenerator.generateErrorView('Unknown Error', this.lastError);
        } else {
            let vw = this.generateHistoryView();
            fs.writeFileSync('/Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/src/test.html', vw);
            return vw;
        }
    }

    private errorMessage(error: string): string {
        return `
            <body>
                ${error}
            </body>`;
    }

    private generateHistoryView(): string {
        const now = new Date().toString();
        let innerHtml = '';
        let menuHtml = '';
        let menuStyles = '';
        let styles = '';

        switch (currentStatus) {
            case ViewStatus.Unknown:
            case ViewStatus.Loading: {
                innerHtml = htmlGenerator.generateProgressHtmlView('Loading');
                styles = htmlResources.PROGRESS_STYLES;
                break;
            }
            case ViewStatus.Idle: {
                // menuStyles = htmlGenerator.MENU_STYLES;
                // menuHtml = htmlGenerator.generateHtmlForMenu(testManager.status, this.tests);
                innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
                // styles = htmlGenerator.HISTORY_STYLES;
                break;
            }
        }

        return `
                <head>
                <link rel="stylesheet" href="file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/reset.css">
                <link rel="stylesheet" href="file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/hint.base.min.css">
                <link rel="stylesheet" href="file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/octicons/font/octicons.css">
                <link rel="stylesheet" href="file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/main.css">
                ${styles}
                ${menuStyles}
                </head>
                <body id="myBody" onload="var script = document.createElement('script');script.setAttribute('src', 'file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/out/src/browser/proxy.js');script.setAttribute('type', 'text/javascript');document.getElementById('myBody').appendChild(script);">
                    ${menuHtml}
                    ${innerHtml}
                    <div class="hidden">
                        <div class="script">file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/node_modules/jquery/dist/jquery.min.js</div>
                        <div class="script">file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/node_modules/clipboard/dist/clipboard.min.js</div>
                        <div class="script">file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/out/src/browser/svgGenerator.js</div>
                    </div>
                </body>
                `;
    }
}

export function activate(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);

    let disposable = vscode.commands.registerCommand('git.viewHistory', () => {
        // Unique name everytime, so that we always refresh the history log
        // historyRetrieved = false;
        // pageIndex = 0;
        // pageSize = 500;
        // canGoPrevious = false;
        // canGoNext = true;
        //previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history' + new Date().getTime().toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, 'Git History').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);

    disposable = vscode.commands.registerCommand('git.copyText', (sha: string) => {
        vscode.window.showInformationMessage(sha);
    });

    disposable = vscode.commands.registerCommand('git.logNavigate', (direction: string) => {
        pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
        provider.update(previewUri);
    });

    context.subscriptions.push(disposable);
}