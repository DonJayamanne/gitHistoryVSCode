import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri, workspace } from 'vscode';
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
        const locale: string = decodeURIComponent(query.locale!.toString());
        const file: string = decodeURIComponent(query.file!.toString());
        return this.generateResultsView(port, internalPort, id, branchName, branchSelection, locale, file);
    }
    private generateResultsView(port: number, internalPort: number, id: string, branchName: string, branchSelection: BranchSelection, locale: string, file: string): string {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        // this.provided = true;
        const queryArgs = [
            `id=${id}`,
            `branchName=${encodeURIComponent(branchName)}`,
            `file=${encodeURIComponent(file)}`,
            'theme=',
            `branchSelection=${branchSelection}`,
            `locale=${encodeURIComponent(locale)}`
        ];

        const config = workspace.getConfiguration('gitHistory');
        const settings = {
            id,
            branchName,
            file,
            branchSelection
        };

        // tslint:disable-next-line:no-http-string
        const uri = `http://localhost:${port}/?_&${queryArgs.join('&')}`;
        this.serviceContainer.getAll<ILogService>(ILogService)
            .forEach(logger => {
                logger.log(`Server running on ${uri}`);
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
                        window['locale'] = '${locale}';

                        var request = new XMLHttpRequest();
                        request.open('GET', 'http://localhost:${internalPort}/', true);
                        request.onload = function() {
                            // get the correct url (after redirection)
                            window['server_url'] = this.responseURL;
                        };
                        request.send();

                        </script>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="text/javascript" src="http://localhost:${internalPort}/bundle.js"></script>
                    </body>
                </html>`;
    }
}
