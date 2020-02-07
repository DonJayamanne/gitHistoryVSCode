'use strict';
import * as querystring from 'query-string';
import { CancellationToken, TextDocumentContentProvider, Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';

export class CommitFileViewerProvider implements TextDocumentContentProvider {
    constructor(private svcContainer: IServiceContainer) { }

    public async provideTextDocumentContent(uri: Uri, _token: CancellationToken): Promise<string> {
        const query = querystring.parse(uri.query) as { workspaceFolder: string; hash: string; fsPath: string };
        const gitService = await this.svcContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(Uri.parse(query.fsPath));
        return gitService.getCommitFileContent(query.hash, Uri.file(query.fsPath));
    }
}
