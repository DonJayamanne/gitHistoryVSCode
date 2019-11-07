import { inject } from 'inversify';
import * as querystring from 'query-string';
import { Disposable, Uri, ViewColumn, Webview, WebviewPanel } from 'vscode';
import { window } from 'vscode';
import { ICommandManager } from '../application/types';
import { IServiceContainer } from '../ioc/types';
import { ContentProvider } from './contentProvider';

export class HtmlViewer {
    private readonly disposable: Disposable[] = [];
    private readonly contentProvider: ContentProvider;
    private readonly htmlView: Map<string, WebviewPanel>;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.htmlView = new Map<string, WebviewPanel>();
        const commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.disposable.push(commandManager.registerCommand('previewHtml', this.onPreviewHtml));
        this.contentProvider = new ContentProvider(serviceContainer);
    }

    public dispose() {
        this.disposable.forEach(disposable => disposable.dispose());
    }
    private onPreviewHtml = (uri: string, column: ViewColumn, title: string) => {
        return this.getHtmlView(Uri.parse(uri), column, title);
    }
    private getHtmlView(uri: Uri, column: ViewColumn, title: string): Webview {
        if (this.htmlView.has(uri.toString())) {
            return this.htmlView.get(uri.toString())!.webview;
        }

        const query = querystring.parse(uri.query.toString())!;
        const port: number = parseInt(query.port!.toString(), 10);
        const internalPort: number = parseInt(query.internalPort!.toString(), 10);

        // tslint:disable-next-line:no-any
        const htmlContent = this.contentProvider.provideTextDocumentContent(uri, undefined as any);
        const webviewPanel = window.createWebviewPanel('gitLog', title, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            portMapping: [
                { webviewPort: internalPort, extensionHostPort: port}
            ]
         });
        this.htmlView.set(uri.toString(), webviewPanel);
        webviewPanel.onDidDispose(() => {
            if (this.htmlView.has(uri.toString())) {
                this.htmlView.delete(uri.toString());
            }
        });
        webviewPanel.webview.html = htmlContent;

        return webviewPanel.webview;
    }
}
