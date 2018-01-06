import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri, ViewColumn } from 'vscode';
import { IDocumentManager } from '../application/types';
import { ICommandManager } from '../application/types/commandManager';
import { FileCommitContext, IUiService } from '../common/types';
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
    public async selectFile(context: FileCommitContext) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(context);
        if (!cmd) {
            return;
        }
        return cmd.execute();
    }

    public async viewFile(context: FileCommitContext) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const uri = await this.getFileUri(gitService, context);
        const doc = await this.documentManager.openTextDocument(uri);
        this.documentManager.showTextDocument(doc, { viewColumn: ViewColumn.Two, preview: true });
    }

    public async compareFileWithWorkspace(context: FileCommitContext) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const tmpFile = await gitService.getCommitFile(context.logEntry.hash.full, context.committedFile.uri);
        const fileName = path.basename(context.committedFile.uri.fsPath);
        const title = `${fileName} (Working Tree)`;
        this.commandManager.executeCommand('vscode.diff', tmpFile as Uri, Uri.file(context.committedFile.uri.fsPath), title, { preview: true });
    }

    public async compareFileWithPrevious(context: FileCommitContext) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);

        const tmpFilePromise = gitService.getCommitFile(context.logEntry.hash.full, context.committedFile!.uri);
        const previousCommitHashPromise = gitService.getPreviousCommitHashForFile(context.logEntry.hash.full, context.committedFile!.uri);

        const values = await Promise.all([tmpFilePromise, previousCommitHashPromise]);
        const tmpFile = values[0];
        const previousCommitHash = values[1];

        const previousFile = context.committedFile!.oldUri ? context.committedFile!.oldUri! : context.committedFile!.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommitHash.full, previousFile);

        const title = this.getComparisonTitle({ file: Uri.file(context.committedFile!.uri.fsPath), hash: context.logEntry.hash }, { file: Uri.file(previousFile.fsPath), hash: previousCommitHash });
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
    private async getFileUri(_gitService: IGitService, context: FileCommitContext): Promise<Uri> {
        const args = [
            `workspaceFolder=${encodeURIComponent(context.workspaceFolder)}`,
            `hash=${context.logEntry.hash.short}`,
            `fsPath=${encodeURIComponent(context.committedFile!.uri.fsPath)}`
        ];
        const ext = path.extname(context.committedFile!.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${context.committedFile!.relativePath}.${context.logEntry.hash.short}${ext}?${args.join('&')}`);
    }
}
