import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri, ViewColumn, window } from 'vscode';
import { ICommandManager } from '../application/types';
import { FileCommitDetails } from '../common/types';
import { previewUri } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { FileNode } from '../nodes/types';
import { IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitHistoryCommandHandler } from './types';
import { Repository } from '../adapter/repository/git.d';
import { IWorkspaceService } from '../application/types/workspace';

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    private workspace: IWorkspaceService;
    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
    ) {
        this.workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
    }

    @command('git.viewFileHistory', IGitHistoryCommandHandler)
    public async viewFileHistory(info?: FileCommitDetails | Uri): Promise<void> {
        let fileUri: Uri | undefined;
        if (info) {
            if (info instanceof FileCommitDetails) {
                const committedFile = info.committedFile;
                fileUri = committedFile.uri ? Uri.file(committedFile.uri.path) : Uri.file(committedFile.oldUri!.path);
            } else if (info instanceof FileNode) {
                const committedFile = info.data!.committedFile;
                fileUri = committedFile.uri ? Uri.file(committedFile.uri.path) : Uri.file(committedFile.oldUri!.path);
            } else if (info instanceof Uri) {
                fileUri = info;
            } else if ((info as any).resourceUri) {
                fileUri = (info as any).resourceUri as Uri;
            }
        } else {
            const activeTextEditor = window.activeTextEditor!;
            if (!activeTextEditor || activeTextEditor.document.isUntitled) {
                return;
            }
            fileUri = activeTextEditor.document.uri;
        }

        return this.viewHistory(fileUri);
    }
    @command('git.viewLineHistory', IGitHistoryCommandHandler)
    public async viewLineHistory(): Promise<void> {
        const activeTextEditor = window.activeTextEditor!;
        if (!activeTextEditor || activeTextEditor.document.isUntitled) {
            return;
        }

        const fileUri: Uri | undefined = activeTextEditor.document.uri;
        const currentLineNumber = activeTextEditor.selection.start.line + 1;

        return this.viewHistory(fileUri, currentLineNumber);
    }
    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewBranchHistory(repo?: Repository): Promise<void> {
        if (repo) {
            return this.viewHistory(repo.rootUri);
        }
        return this.viewHistory();
    }

    public async viewHistory(fileUri?: Uri, lineNumber?: number): Promise<void> {
        const gitServiceFactory = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory);

        const gitService = await gitServiceFactory.createGitService(fileUri);
        const gitRoot = gitService.getGitRoot();

        if (gitRoot === fileUri?.path) {
            fileUri = undefined;
        }

        const id = gitServiceFactory.getIndex();

        const queryArgs = [`id=${id}`, `file=${fileUri ? encodeURIComponent(fileUri.fsPath) : ''}`];

        if (lineNumber) {
            queryArgs.push(`line=${lineNumber}`);
        }

        const uri = `${previewUri}?${queryArgs.join('&')}`;

        let title = `Git History (${path.basename(gitRoot)})`;

        if (fileUri) {
            title = `File History (${path.basename(fileUri.fsPath)})`;
            if (typeof lineNumber === 'number') {
                title = `Line History (${path.basename(fileUri.fsPath)}#${lineNumber})`;
            }
        }

        let column = ViewColumn.One;
        const showFileHistorySplit = this.workspace
            .getConfiguration('gitHistory')
            .get<boolean>('showFileHistorySplit', false);
        if (showFileHistorySplit && window.activeTextEditor?.document.uri.path == fileUri?.path) {
            column = ViewColumn.Two;
        }

        const fileName = fileUri != null ? path.basename(fileUri.fsPath) : null;
        this.commandManager.executeCommand('previewHtml', uri, column, title, fileName);
    }
}
