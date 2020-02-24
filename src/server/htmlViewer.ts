import { inject } from 'inversify';
import * as querystring from 'query-string';
import { Disposable, Uri, ViewColumn, WebviewPanel, workspace, env } from 'vscode';
import { window } from 'vscode';
import { ICommandManager } from '../application/types';
import { IServiceContainer } from '../ioc/types';
import { ApiController } from './apiController';
import { IGitServiceFactory, BranchSelection } from '../types';
import * as path from 'path';
import * as fs from 'fs';

export class HtmlViewer {
    private readonly disposable: Disposable[] = [];
    private readonly commandManager: ICommandManager;
    private readonly htmlView: Map<string, WebviewPanel>;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer, 
                @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory, 
                private extensionPath: string) {
        this.htmlView = new Map<string, WebviewPanel>();
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.disposable.push(this.commandManager.registerCommand('previewHtml', this.onPreviewHtml));
    }

    public dispose() {
        this.disposable.forEach(disposable => disposable.dispose());
    }
    private onPreviewHtml = (uri: string, column: ViewColumn, title: string) => {
        this.createHtmlView(Uri.parse(uri), column, title);
    }
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

        // tslint:disable-next-line:no-any
        const webviewPanel = window.createWebviewPanel('gitLog', title, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [Uri.file(path.join(this.extensionPath,'out', 'browser'))]
         });
        this.htmlView.set(uri.toString(), webviewPanel);

        const gitService = this.gitServiceFactory.getService(id);
        const apiController = new ApiController(webviewPanel.webview, gitService, this.serviceContainer, this.commandManager);

        webviewPanel.onDidDispose(() => {
            if (this.htmlView.has(uri.toString())) {
                this.htmlView.delete(uri.toString());
            }
            apiController.dispose();
        });

        let branchName = await gitService.getCurrentBranch();
        let branchSelection = BranchSelection.Current;
        
        
        const settings = {
            id,
            branchName,
            file,
            branchSelection
        };


        let mappedPathes = {};

        webviewPanel.webview.options.localResourceRoots!.forEach(obj => {
            const files = fs.readdirSync(obj.fsPath);

            files.forEach(x => {
                const relPath = path.relative(this.extensionPath, path.join(obj.fsPath, x));
                mappedPathes[relPath] =  webviewPanel.webview.asWebviewUri(Uri.parse( path.join(obj.fsPath, x)));
            });
        });

        webviewPanel.webview.html = this.getHtmlContent(settings, mappedPathes);
    }

    private getHtmlContent(settings, mappedPathes) {

        const config = workspace.getConfiguration('gitHistory');

        return `<!DOCTYPE html>
        <html>
            <head>
                <style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; }</style>
                <meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* vscode-resource: 'unsafe-inline' 'unsafe-eval'; img-src *" />
                <link rel='stylesheet' type='text/css' href='${mappedPathes['out/browser/bundle.css']}' />
            <title>Git History</title>
            <script type="text/javascript">
                window['vscode'] = acquireVsCodeApi();
                window['configuration'] = ${JSON.stringify(config)};
                window['settings'] = ${JSON.stringify(settings)};
                window['locale'] = '${env.language}';
            </script>
            </head>
            <body>
                <div id="root"></div>
                <script src="${mappedPathes['out/browser/bundle.js']}"></script>
            </body>
        </html>`;
    }
}
