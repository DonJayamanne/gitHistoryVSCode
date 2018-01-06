import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri, ViewColumn } from 'vscode';
import { IDocumentManager } from '../application/types';
import { ICommandManager } from '../application/types/commandManager';
import { FileCommitData, IUiService } from '../common/types';
import { gitHistoryFileViewerSchema } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { Hash, IGitService, IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitFileHistoryCommandHandler } from './types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IDocumentManager) private documentManager: IDocumentManager) { }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async selectFile(fileCommit: FileCommitData) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(fileCommit);
        if (!cmd) {
            return;
        }
        return cmd.execute();
    }

    public async viewFile(fileCommit: FileCommitData) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);
        const uri = await this.getFileUri(gitService, fileCommit);
        const doc = await this.documentManager.openTextDocument(uri);
        this.documentManager.showTextDocument(doc, { viewColumn: ViewColumn.Two, preview: true });
    }

    public async compareFileWithWorkspace(fileCommit: FileCommitData) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);
        const tmpFile = await gitService.getCommitFile(fileCommit.logEntry.hash.full, fileCommit.committedFile.uri);
        const fileName = path.basename(fileCommit.committedFile.uri.fsPath);
        const title = `${fileName} (Working Tree)`;
        this.commandManager.executeCommand('vscode.diff', tmpFile as Uri, Uri.file(fileCommit.committedFile.uri.fsPath), title, { preview: true });
    }

    public async compareFileWithPrevious(fileCommit: FileCommitData) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);

        const tmpFilePromise = gitService.getCommitFile(fileCommit.logEntry.hash.full, fileCommit.committedFile!.uri);
        const previousCommitHashPromise = gitService.getPreviousCommitHashForFile(fileCommit.logEntry.hash.full, fileCommit.committedFile!.uri);

        const values = await Promise.all([tmpFilePromise, previousCommitHashPromise]);
        const tmpFile = values[0];
        const previousCommitHash = values[1];

        const previousFile = fileCommit.committedFile!.oldUri ? fileCommit.committedFile!.oldUri! : fileCommit.committedFile!.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommitHash.full, previousFile);

        const title = this.getComparisonTitle({ file: Uri.file(fileCommit.committedFile!.uri.fsPath), hash: fileCommit.logEntry.hash }, { file: Uri.file(previousFile.fsPath), hash: previousCommitHash });
        this.commandManager.executeCommand('vscode.diff', tmpFile, previousTmpFile, title, { preview: true });
    }
    private getComparisonTitle(left: { file: Uri, hash: Hash }, right: { file: Uri, hash: Hash }) {
        const leftFileName = path.basename(left.file.fsPath);
        const rightFileName = path.basename(right.file.fsPath);
        if (leftFileName === rightFileName) {
            return `${leftFileName} (${left.hash.short} ↔ ${right.hash.short})`;
        } else {
            return `${leftFileName} (${left.hash.short} ↔ ${rightFileName} ${right.hash.short})`;
        }
    }
    private async getFileUri(_gitService: IGitService, fileCommit: FileCommitData): Promise<Uri> {
        const args = [
            `workspaceFolder=${encodeURIComponent(fileCommit.workspaceFolder)}`,
            `hash=${fileCommit.logEntry.hash.short}`,
            `fsPath=${encodeURIComponent(fileCommit.committedFile!.uri.fsPath)}`
        ];
        const ext = path.extname(fileCommit.committedFile!.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${fileCommit.committedFile!.relativePath}.${fileCommit.logEntry.hash.short}${ext}?${args.join('&')}`);
    }
}
