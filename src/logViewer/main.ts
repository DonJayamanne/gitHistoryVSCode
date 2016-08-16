'use strict';

import * as vscode from 'vscode';
import * as htmlGenerator from './htmlGenerator';
import * as fs from 'fs';
import * as gitHist from '../helpers/gitHistory';
import * as parser from'../logParser';
import {ActionedDetails, LogEntry, Sha1} from '../contracts';
import * as path from 'path';

const gitHistorySchema = 'git-history-viewer';
const PAGE_SIZE = 500;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved: boolean;
let pageIndex = 0;
let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private lastUri: vscode.Uri;
    private entries: LogEntry[];

    public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Thenable<string> {
        return gitHist.getHistory(vscode.workspace.rootPath, pageIndex, pageSize).then(entries => {
            canGoPrevious = pageIndex > 0;
            canGoNext = entries.length === pageSize;
            this.entries = entries;
            let html = this.generateHistoryView();
            // fs.writeFileSync(path.join(__dirname, '..', '..', 'src', 'test.html'), html);
            return html;
        }).catch(error => {
            return this.generateErrorView(error);
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private getStyleSheetPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'resources', resourceName)).toString();
    }
    private getScriptFilePath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, '..', 'browser', resourceName)).toString();
    }
    private getNodeModulesPath(resourceName: string): string {
        return vscode.Uri.file(path.join(__dirname, resourceName)).toString();
    }

    private generateErrorView(error: string): string {
        const resourcesPath = path.join(__dirname, '..', '..', 'resources');
        return `
            <head>
                <link rel="stylesheet" href="${this.getStyleSheetPath('reset.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('font-awesome-4.6.3', 'css', 'font-awesome.min.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                <style>
                </style>
                <div class="errorContents">
                    <div><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>Error</div>
                    <div>${error}</div>
                </div>
            </body>
            `;
    }

    private generateHistoryView(): string {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
        return `
                <head>
                    <link rel="stylesheet" href="${this.getStyleSheetPath('reset.css')}" >
                    <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                    <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('font-awesome-4.6.3', 'css', 'font-awesome.min.css'))}" >
                    <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('hint.base.min.css'))}" >
                    <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                </head>
                <body id= "myBody" onload="var script = document.createElement('script');script.setAttribute('src', '${this.getScriptFilePath('proxy.js')}');script.setAttribute('type', 'text/javascript');document.getElementById('myBody').appendChild(script);">
                    ${innerHtml}
                <div class="hidden">
                    <div class="script">${this.getScriptFilePath(path.join('jquery','dist','jquery.min.js'))}</div>
                    <div class="script">${this.getScriptFilePath(path.join('clipboard','dist','clipboard.min.js'))}</div>
                    <div class="script">${this.getScriptFilePath(path.join('moment','min','moment.min.js'))}</div>
                    <div class="script">${this.getScriptFilePath('svgGenerator.js')}</div>
                    <div class="script">${this.getScriptFilePath('detailsView.js')}</div>
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
        // Untill we add a refresh button to the view
        historyRetrieved = false;
        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;
        previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
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