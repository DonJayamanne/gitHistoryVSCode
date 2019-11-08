import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri } from 'vscode';
import { ILogService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection } from '../types';

export class ContentProvider implements TextDocumentContentProvider {
    constructor(private serviceContainer: IServiceContainer) {
    }
    public provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
        const query = querystring.parse(uri.query.toString())!;
        const port: number = parseInt(query.port!.toString(), 10);
        const internalPort: number = parseInt(query.internalPort!.toString(), 10);
        const id: string = query.id! as string;
        const branchName: string | undefined = query.branchName ? decodeURIComponent(query.branchName! as string) : '';
        const branchSelection: BranchSelection = parseInt(query.branchSelection!.toString(), 10) as BranchSelection;
        const locale: string = decodeURIComponent(query.locale!.toString()) as string;
        const file: string = decodeURIComponent(query.file!.toString()) as string;
        return this.generateResultsView(port, internalPort, id, branchName, branchSelection, locale, file);
    }
    private generateResultsView(port: number, internalPort: number, id: string, branchName: string, branchSelection: BranchSelection, locale: string, file: string): string {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        // this.provided = true;
        const timeNow = ''; // new Date().getTime();
        const queryArgs = [
            `id=${id}`,
            `branchName=${encodeURIComponent(branchName)}`,
            `file=${encodeURIComponent(file)}`,
            'theme=',
            `branchSelection=${branchSelection}`,
            `locale=${encodeURIComponent(locale)}`
        ];

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
                        <meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* 'unsafe-inline' 'unsafe-eval';" />
                    <title>Git History</title>
                    <script type="text/javascript">
                        function frameLoaded() {
                            console.log('Sending styles through postMessage');
                            var styleText = document.getElementsByTagName("html")[0].style.cssText;
                            // since the nested iframe may become the origin http://127.0.0.1:<randomPort>
                            // it is necessary to use asterisk
                            document.getElementById('myframe').contentWindow.postMessage(styleText,"*");
                        }

                        function start() {
                            var queryArgs = [
                                'id=${id}',
                                'branchName=${encodeURIComponent(branchName)}',
                                'file=${encodeURIComponent(file)}',
                                'branchSelection=${branchSelection}',
                                'locale=${encodeURIComponent(locale)}',
                                'theme=' + document.body.className
                            ];
                            
                            document.getElementById('myframe').src = 'http://localhost:${internalPort}/?_=${timeNow}&' + queryArgs.join('&');
                            document.getElementById('myframe').onload = frameLoaded;
                        }
                        </script>
                    </head>
                    <body onload="start()">
                        <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe>
                    </body>
                </html>`;
    }
}
