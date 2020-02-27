import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri, workspace, env } from 'vscode';
import { ILogService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection } from '../types';

export class ContentProvider implements TextDocumentContentProvider {
    constructor(private serviceContainer: IServiceContainer) {
    }
    public provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
        const query = querystring.parse(uri.query.toString());
        const port: number = parseInt(query.port!.toString(), 10);
        const internalPort: number = parseInt(query.internalPort!.toString(), 10);
        const id: string = query.id! as string;
        const branchName: string | undefined = query.branchName ? decodeURIComponent(query.branchName as string) : '';
        const branchSelection: BranchSelection = parseInt(query.branchSelection!.toString(), 10) as BranchSelection;
        const file: string = decodeURIComponent(query.file!.toString());
        const lineNumber: number | undefined = query.line ? parseInt(query.line!.toString(), 10) : undefined;
        const queryArgs = [
            `id=${id}`,
            `branchName=${encodeURIComponent(branchName)}`,
            `file=${encodeURIComponent(file)}`,
            `branchSelection=${branchSelection}`
        ];

        const config = workspace.getConfiguration('gitHistory');
        const settings = {
            id,
            branchName,
            file,
            lineNumber,
            branchSelection
        };

        this.serviceContainer.getAll<ILogService>(ILogService)
            .forEach(logger => {
                logger.log(`Server running on http://localhost:${port}/?${queryArgs.join('&')}`);
                logger.log(`Webview port: ${internalPort}`);
            });

        return `<!DOCTYPE html>
                <html>
                    <head>
                        <style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; }</style>
                        <meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* 'unsafe-inline' 'unsafe-eval'; img-src *" />
                        <link rel='stylesheet' type='text/css' href='http://localhost:${internalPort}/bundle.css' />
                    <title>Git History</title>
                    <script type="text/javascript">
                        window['configuration'] = ${JSON.stringify(config)};
                        window['settings'] = ${JSON.stringify(settings)};
                        window['locale'] = '${env.language}';
                        window['server_url'] = 'http://localhost:${internalPort}/';

                        // Since CORS is not permitted for redirects and
                        // a redirect from http://localhost:<internalPort> to http://127.0.0.1:<randomPort>
                        // may occur in some cases (proberly due to proxy bypass)
                        // it is necessary to use the "redirected" URL.
                        // This only applies to other methods than "GET" (E.g. POST)
                        // Further info: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSExternalRedirectNotAllowed

                        var request = new XMLHttpRequest();
                        request.open('GET', 'http://localhost:${internalPort}/', true);
                        request.onload = function() {
                            // get the redirected URL
                            window['server_url'] = this.responseURL;
                            console.log("Expected URL: " + this.responseURL + "?${queryArgs.join('&')}");

                            // Load the react app
                            var script = document.createElement('script');
                            script.src = this.responseURL + '/bundle.js';
                            document.head.appendChild(script);
                        };
                        request.send();

                        </script>
                    </head>
                    <body>
                        <div id="root"></div>
                    </body>
                </html>`;
    }
}
