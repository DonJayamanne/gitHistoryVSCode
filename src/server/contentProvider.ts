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
                        <meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* 'unsafe-inline' 'unsafe-eval';" />
                        <link rel='stylesheet' type='text/css' href='http://localhost:${internalPort}/bundle.css' />
                    <title>Git History</title>
                    <script type="text/javascript">
                        window['configuration'] = ${JSON.stringify(config)};
                        window['settings'] = ${JSON.stringify(settings)};
                        window['locale'] = '${env.language}';

                        window['server_url'] = 'http://localhost:${internalPort}/';
                        </script>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="text/javascript" src="http://localhost:${internalPort}/bundle.js"></script>
                    </body>
                </html>`;
    }
}
