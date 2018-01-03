import { inject, injectable } from 'inversify';
import * as path from 'path';
import { commands, Disposable, Uri, ViewColumn, window, workspace } from 'vscode';
import { ICommandManager } from '../application/types/commandManager';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import { gitHistoryFileViewerSchema } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { CommittedFile, Hash, IGitService, IGitServiceFactory, LogEntry } from '../types';
import { IGitFileHistoryCommandHandler } from './types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler {
    private disposables: Disposable[] = [];
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager) {
        // this.disposables.push(this.commandManager.registerCommand('git.commit.file.select', this.onFileSelected, this));
        // this.disposables.push(this.commandManager.registerCommand('git.commit.file.viewFileContents', this.onViewFile, this));
        // this.disposables.push(this.commandManager.registerCommand('git.commit.file.compareAgainstWorkspace', this.onCompareFileWithWorkspace, this));
        // this.disposables.push(this.commandManager.registerCommand('git.commit.file.compareAgainstPrevious', this.onCompareFileWithPrevious, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async onFileSelected(workspaceFolder: string, branch: string | undefined, logEntry: LogEntry, commitedFile: CommittedFile) {
        const commandName = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(commitedFile);
        if (!commandName) {
            return;
        }
        this.commandManager.executeCommand(commandName, workspaceFolder, branch, logEntry.hash, commitedFile);
    }

    @command('git.commit.file.viewFileContents', IGitFileHistoryCommandHandler)
    public async onViewFile(workspaceFolder: string, _branch: string | undefined, hash: Hash, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const uri = await this.getFileUri(gitService, workspaceFolder, hash, commitedFile);
        const doc = await workspace.openTextDocument(uri);
        window.showTextDocument(doc, { viewColumn: ViewColumn.Two, preview: true });
    }

    @command('git.commit.file.compareAgainstWorkspace', IGitFileHistoryCommandHandler)
    public async onCompareFileWithWorkspace(workspaceFolder: string, _branch: string | undefined, hash: Hash, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const tmpFile = await gitService.getCommitFile(hash.full, commitedFile.uri);
        const fileName = path.basename(commitedFile.uri.fsPath);
        const title = `${fileName} (Working Tree)`;
        this.commandManager.executeCommand('vscode.diff', tmpFile as Uri, Uri.file(commitedFile.uri.fsPath), title, { preview: true });
    }

    @command('git.commit.file.compareAgainstPrevious', IGitFileHistoryCommandHandler)
    public async onCompareFileWithPrevious(workspaceFolder: string, _branch: string | undefined, hash: Hash, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);

        const tmpFilePromise = gitService.getCommitFile(hash.full, commitedFile.uri);
        const previousCommitHashPromise = gitService.getPreviousCommitHashForFile(hash.full, commitedFile.uri);

        const values = await Promise.all([tmpFilePromise, previousCommitHashPromise]);
        const tmpFile = values[0];
        const previousCommitHash = values[1];

        const previousFile = commitedFile.oldUri ? commitedFile.oldUri : commitedFile.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommitHash.full, previousFile);

        const title = this.getComparisonTitle({ file: Uri.file(commitedFile.uri.fsPath), hash }, { file: Uri.file(previousFile.fsPath), hash: previousCommitHash });
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
    private async getFileUri(_gitService: IGitService, workspaceFolder: string, hash: Hash, commitedFile: CommittedFile): Promise<Uri> {
        const args = [
            `workspaceFolder=${encodeURIComponent(workspaceFolder)}`,
            `hash=${hash}`,
            `fsPath=${encodeURIComponent(commitedFile.uri.fsPath)}`
        ];
        const ext = path.extname(commitedFile.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${commitedFile.relativePath}.${hash.short}${ext}?${args.join('&')}`);
    }
}
