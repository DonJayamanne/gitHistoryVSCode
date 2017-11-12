import { injectable } from 'inversify';
import * as path from 'path';
import { commands, Disposable, Uri, ViewColumn, window, workspace } from 'vscode';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import { gitHistoryFileViewerSchema } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { CommittedFile, Hash, IGitService, IGitServiceFactory } from '../types';
import { IGitFileHistoryCommandHandler } from './types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler {
    private disposables: Disposable[] = [];
    constructor(private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.file.select', this.onFileSelected, this));
        // this.disposables.push(commands.registerCommand('git.commit.file.viewFileContents', this.onViewFile, this));
        // this.disposables.push(commands.registerCommand('git.commit.file.compareAgainstWorkspace', this.onCompareFileWithWorkspace, this));
        // this.disposables.push(commands.registerCommand('git.commit.file.compareAgainstPrevious', this.onCompareFileWithPrevious, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async onFileSelected(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const commandName = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(commitedFile);
        if (!commandName) {
            return;
        }
        commands.executeCommand(commandName, workspaceFolder, branch, hash, commitedFile);
    }

    @command('git.commit.file.viewFileContents', IGitFileHistoryCommandHandler)
    public async onViewFile(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const uri = await this.getFileUri(gitService, workspaceFolder, hash, commitedFile);
        const doc = await workspace.openTextDocument(uri);
        window.showTextDocument(doc, { viewColumn: ViewColumn.Two, preview: true });
    }

    @command('git.commit.file.compareAgainstWorkspace', IGitFileHistoryCommandHandler)
    public async onCompareFileWithWorkspace(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const tmpFile = await gitService.getCommitFile(hash, commitedFile.uri);
        const fileName = path.basename(commitedFile.uri.fsPath);
        const title = `${fileName} (Working Tree)`;
        commands.executeCommand('vscode.diff', tmpFile as Uri, Uri.file(commitedFile.uri.fsPath), title, { viewColumn: ViewColumn.Two, preview: true });
    }

    @command('git.commit.file.compareAgainstPrevious', IGitFileHistoryCommandHandler)
    public async onCompareFileWithPrevious(workspaceFolder: string, branch: string | undefined, hash: string, commitedFile: CommittedFile) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);

        const hashesPromise = await gitService.getHash(hash);
        const tmpFilePromise = await gitService.getCommitFile(hash, commitedFile.uri);
        const previousCommitPromise = await gitService.getPreviousCommitHashForFile(hash, commitedFile.uri);

        const values = await Promise.all([hashesPromise, tmpFilePromise, previousCommitPromise]);
        const hashes = values[0];
        const tmpFile = values[1];
        const previousCommit = values[2];

        const previousFile = commitedFile.oldUri ? commitedFile.oldUri : commitedFile.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommit.full, previousFile);

        const title = this.getComparisonTitle({ file: Uri.file(commitedFile.uri.fsPath), hash: hashes }, { file: Uri.file(previousFile.fsPath), hash: previousCommit });
        commands.executeCommand('vscode.diff', tmpFile, previousTmpFile, title, { viewColumn: ViewColumn.Two, preview: true });
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
    private async getFileUri(gitService: IGitService, workspaceFolder: string, hash: string, commitedFile: CommittedFile): Promise<Uri> {
        const hashes = await gitService.getHash(hash);

        const args = [
            `workspaceFolder=${encodeURIComponent(workspaceFolder)}`,
            `hash=${hash}`,
            `fsPath=${encodeURIComponent(commitedFile.uri.fsPath)}`
        ];
        const ext = path.extname(commitedFile.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${commitedFile.relativePath}.${hashes.short}${ext}?${args.join('&')}`);
    }
}
