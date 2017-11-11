'use strict';
// import * as path from 'path';
// import * as fs from 'fs-extra';
import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri } from 'vscode';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
// import { gitHistorySchema } from '../constants';

export class CommitFileViewerProvider implements TextDocumentContentProvider {

    // constructor(private svcContainer: IServiceContainer) { }

    public async provideTextDocumentContent(uri: Uri, token: CancellationToken): Promise<string> {
        // tslint:disable-next-line:no-console
        // console.log(this.svcContainer);
        // const query = querystring.parse(uri.query) as { workspaceFolder: string, hash: string, fsPath: string };
        // const gitService = this.svcContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(query.workspaceFolder);
        // // return gitService.getCommitFileContent(query.hash, Uri.parse(query.fsPath));
        return '1234';
        // return 'Hello';
    }
}
