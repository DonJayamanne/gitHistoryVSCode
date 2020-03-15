import { inject } from 'inversify';
import * as path from 'path';
import * as querystring from 'query-string';
import { Disposable, env, Uri, ViewColumn, Webview, WebviewPanel, workspace } from 'vscode';
import { window } from 'vscode';
import { ICommandManager } from '../application/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { ApiController } from './apiController';

export class HtmlViewer {
    private readonly disposable: Disposable[] = [];
    private readonly commandManager: ICommandManager;
    private readonly htmlView: Map<string, WebviewPanel>;
    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        private extensionPath: string,
    ) {
        this.htmlView = new Map<string, WebviewPanel>();
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.disposable.push(this.commandManager.registerCommand('previewHtml', this.onPreviewHtml));
    }

    public dispose() {
        this.disposable.forEach(disposable => disposable.dispose());
    }
    private onPreviewHtml = (uri: string, column: ViewColumn, title: string) => {
        this.createHtmlView(Uri.parse(uri), column, title);
    };
    private async createHtmlView(uri: Uri, column: ViewColumn, title: string) {
        if (this.htmlView.has(uri.toString())) {
            // skip recreating a webview, when already exist
            // and reveal it in tab view
            const webviewPanel = this.htmlView.get(uri.toString());
            if (webviewPanel) {
                webviewPanel.reveal();
            }

            return;
        }

        const query = querystring.parse(uri.query.toString());
        const id: number = parseInt(query.id!.toString(), 10);
        const file: string = decodeURIComponent(query.file!.toString());
        const line: number | undefined = query.line ? parseInt(query.line.toString()) : undefined;

        const webviewPanel = window.createWebviewPanel('gitLog', title, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.htmlView.set(uri.toString(), webviewPanel);

        const gitService = this.gitServiceFactory.getService(id);
        new ApiController(webviewPanel.webview, gitService, this.serviceContainer, this.commandManager);

        webviewPanel.onDidDispose(() => {
            if (this.htmlView.has(uri.toString())) {
                this.htmlView.delete(uri.toString());
            }
        });

        let branchName = gitService.getCurrentBranch();
        let branchSelection = BranchSelection.Current;

        // check if the current branch is detached
        const detached = gitService.getDetachedHash();
        if (!branchName && detached) {
            branchSelection = BranchSelection.Detached;
            branchName = detached;
        }

        const settings = {
            id,
            branchName,
            file,
            line,
            branchSelection,
        };

        webviewPanel.webview.html = this.getHtmlContent(webviewPanel.webview, settings);
    }

    private getRelativeResource(webview: Webview, relativePath: string) {
        // @ts-ignore
        return webview.asWebviewUri(Uri.file(path.join(this.extensionPath, relativePath)));
    }

    private getHtmlContent(webview, settings) {
        const config = workspace.getConfiguration('gitHistory');
        return `<!DOCTYPE html>
        <html>
            <head>
                <style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; }</style>
                <meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* vscode-resource: 'unsafe-inline' 'unsafe-eval'; img-src * vscode-resource:" />
                <link rel='stylesheet' type='text/css' href='${this.getRelativeResource(
                    webview,
                    'dist/browser/bundle.css',
                )}' />
            <title>Git History</title>
            <script type="text/javascript">
                window['vscode'] = acquireVsCodeApi();
                window['extensionPath'] = '${this.extensionPath}';
                window['configuration'] = ${JSON.stringify(config)};
                window['settings'] = ${JSON.stringify(settings)};
                window['locale'] = '${env.language}';
            </script>
            </head>
            <body>
                <div id="root"></div>
                <script src="${this.getRelativeResource(webview, 'dist/browser/bundle.js')}"></script>
            </body>
        </html>`;
    }
}
