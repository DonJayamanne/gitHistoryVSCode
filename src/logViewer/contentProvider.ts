import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri } from 'vscode';
import { BranchSelection } from '../common/types';
// import { decode as htmlDecode } from 'he';

export class ContentProvider implements TextDocumentContentProvider {
    public provideTextDocumentContent(uri: Uri, token: CancellationToken): string {
        const query = querystring.parse(uri.query.toString())!;
        const port: number = parseInt(query.port!.toString(), 10);
        const id: string = query.id! as string;
        const branchName: string = decodeURIComponent(query.branchName! as string);
        const branchSelection: BranchSelection = parseInt(query.branchSelection!.toString(), 10) as BranchSelection;
        return this.generateResultsView(port, id, branchName, branchSelection);
    }

    private generateResultsView(port: number, id: string, branchName: string, branchSelection: BranchSelection): string {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        const timeNow = '';  // new Date().getTime();
        return `
                    <!DOCTYPE html>
                    <head><style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; } </style>
                    <script type="text/javascript">
                        function start(){
                            // We need a unique value so html is reloaded
                            console.log('reloaded results window at time ${timeNow}ms');
                            var color = '';
                            var fontFamily = '';
                            var fontSize = '';
                            var theme = '';
                            var fontWeight = '';
                            try {
                                computedStyle = window.getComputedStyle(document.body);
                                color = computedStyle.color + '';
                                backgroundColor = computedStyle.backgroundColor + '';
                                fontFamily = computedStyle.fontFamily;
                                fontSize = computedStyle.fontSize;
                                fontWeight = computedStyle.fontWeight;
                                theme = document.body.className;
                            }
                            catch(ex){
                            }
                            var queryArgs = [
                                            'id=${id}',
                                            'branchName=${encodeURIComponent(branchName)}',
                                            'branchSelection=${branchSelection}',
                                            'theme=' + theme,
                                            'color=' + encodeURIComponent(color),
                                            'backgroundColor=' + encodeURIComponent(backgroundColor),
                                            'fontFamily=' + encodeURIComponent(fontFamily),
                                            'fontWeight=' + encodeURIComponent(fontWeight),
                                            'fontSize=' + encodeURIComponent(fontSize)
                                        ];
                            document.getElementById('myframe').src = 'http://localhost:${port}/?_=${timeNow}&' + queryArgs.join('&');
                        }
                    </script>
                    </head>
                    <body onload="start()">
                    <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe>
                    </body></html>`;
    }
}
