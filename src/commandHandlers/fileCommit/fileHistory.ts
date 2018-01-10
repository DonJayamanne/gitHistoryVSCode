import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { IApplicationShell, IDocumentManager } from '../../application/types';
import { ICommandManager } from '../../application/types/commandManager';
import { FileCommitDetails, IUiService } from '../../common/types';
import { gitHistoryFileViewerSchema } from '../../constants';
import { IServiceContainer } from '../../ioc/types';
import { FileNode } from '../../nodes/types';
import { IFileSystem } from '../../platform/types';
import { Hash, IGitService, IGitServiceFactory, Status } from '../../types';
import { command } from '../registration';
import { IGitFileHistoryCommandHandler } from '../types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IApplicationShell) private applicationShell: IApplicationShell,
        @inject(IFileSystem) private fileSystem: IFileSystem,
        @inject(IDocumentManager) private documentManager: IDocumentManager) { }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async doSomethingWithFile(fileCommit: FileCommitDetails) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(fileCommit);
        if (!cmd) {
            return;
        }
        return cmd.execute();
    }

    @command('git.commit.FileEntry.ViewFileContents', IGitFileHistoryCommandHandler)
    public async viewFile(nodeOrFileCommit: FileNode | FileCommitDetails): Promise<void> {
        const fileCommit = nodeOrFileCommit instanceof FileCommitDetails ? nodeOrFileCommit : nodeOrFileCommit.data!;
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);
        if (fileCommit.committedFile.status === Status.Deleted) {
            return await this.applicationShell.showErrorMessage('File cannot be viewed as it was deleted').then(() => void 0);
        }
        const uri = await this.getFileUri(gitService, fileCommit);
        const doc = await this.documentManager.openTextDocument(uri);
        this.documentManager.showTextDocument(doc, { preview: true });
    }

    @command('git.commit.FileEntry.CompareAgainstWorkspace', IGitFileHistoryCommandHandler)
    public async compareFileWithWorkspace(nodeOrFileCommit: FileNode | FileCommitDetails): Promise<void> {
        const fileCommit = nodeOrFileCommit instanceof FileCommitDetails ? nodeOrFileCommit : nodeOrFileCommit.data!;
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);
        if (fileCommit.committedFile.status === Status.Deleted) {
            return await this.applicationShell.showErrorMessage('File cannot be compared with, as it was deleted').then(() => void 0);
        }
        if (!await this.fileSystem.fileExistsAsync(fileCommit.committedFile.uri.fsPath)) {
            return await this.applicationShell.showErrorMessage('Corresponding workspace file does not exist').then(() => void 0);
        }

        const tmpFile = await gitService.getCommitFile(fileCommit.logEntry.hash.full, fileCommit.committedFile.uri);
        const fileName = path.basename(fileCommit.committedFile.uri.fsPath);
        const title = `${fileName} (Working Tree)`;
        this.commandManager.executeCommand('vscode.diff', tmpFile as Uri, fileCommit.committedFile.uri, title, { preview: true });
    }

    @command('git.commit.FileEntry.CompareAgainstPrevious', IGitFileHistoryCommandHandler)
    public async compareFileWithPrevious(nodeOrFileCommit: FileNode | FileCommitDetails): Promise<void> {
        const fileCommit = nodeOrFileCommit instanceof FileCommitDetails ? nodeOrFileCommit : nodeOrFileCommit.data!;
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);

        if (fileCommit.committedFile.status === Status.Deleted) {
            return await this.applicationShell.showErrorMessage('File cannot be compared with, as it was deleted').then(() => void 0);
        }
        if (fileCommit.committedFile.status === Status.Added) {
            return await this.applicationShell.showErrorMessage('File cannot be compared with previous, as this is a new file').then(() => void 0);
        }

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
    private async getFileUri(_gitService: IGitService, fileCommit: FileCommitDetails): Promise<Uri> {
        const args = [
            `workspaceFolder=${encodeURIComponent(fileCommit.workspaceFolder)}`,
            `hash=${fileCommit.logEntry.hash.short}`,
            `fsPath=${encodeURIComponent(fileCommit.committedFile!.uri.fsPath)}`
        ];
        const ext = path.extname(fileCommit.committedFile!.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${fileCommit.committedFile!.relativePath}.${fileCommit.logEntry.hash.short}${ext}?${args.join('&')}`);
    }
}
