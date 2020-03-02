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

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
    ) {}

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
    public async viewBranchHistory(): Promise<void> {
        return this.viewHistory();
    }

    public async viewHistory(fileUri?: Uri, lineNumber?: number): Promise<void> {
        const gitServiceFactory = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory);

        const gitService = await gitServiceFactory.createGitService(fileUri);
        const gitRoot = gitService.getGitRoot();

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

        this.commandManager.executeCommand('previewHtml', uri, ViewColumn.One, title);
    }
}
