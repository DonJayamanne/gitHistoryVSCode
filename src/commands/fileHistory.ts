import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri, ViewColumn } from 'vscode';
import { IDocumentManager } from '../application/types';
import { ICommandManager } from '../application/types/commandManager';
import { Context, ICommand, IUiService } from '../common/types';
import { gitHistoryFileViewerSchema } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { CommittedFile, Hash, IGitService, IGitServiceFactory, Status } from '../types';
import { command } from './registration';
import { IFileCommitCommandBuilder, IGitFileHistoryCommandHandler } from './types';

@injectable()
export class GitFileHistoryCommandHandler implements IGitFileHistoryCommandHandler, IFileCommitCommandBuilder {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IDocumentManager) private documentManager: IDocumentManager) { }

    @command('git.commit.file.select', IGitFileHistoryCommandHandler)
    public async onFileSelected(context: Context) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectFileCommitCommandAction(context);
        if (!cmd) {
            return;
        }
        return cmd.execute();
    }

    @command('git.commit.file.viewFileContents', IGitFileHistoryCommandHandler)
    public async onViewFile(context: Context) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const uri = await this.getFileUri(gitService, context);
        const doc = await this.documentManager.openTextDocument(uri);
        this.documentManager.showTextDocument(doc, { viewColumn: ViewColumn.Two, preview: true });
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
    public async onCompareFileWithPrevious(context: Context) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);

        const tmpFilePromise = gitService.getCommitFile(context.hash.full, context.committedFile!.uri);
        const previousCommitHashPromise = gitService.getPreviousCommitHashForFile(context.hash.full, context.committedFile!.uri);

        const values = await Promise.all([tmpFilePromise, previousCommitHashPromise]);
        const tmpFile = values[0];
        const previousCommitHash = values[1];

        const previousFile = context.committedFile!.oldUri ? context.committedFile!.oldUri! : context.committedFile!.uri;
        const previousTmpFile = await gitService.getCommitFile(previousCommitHash.full, previousFile);

        const title = this.getComparisonTitle({ file: Uri.file(context.committedFile!.uri.fsPath), hash: context.hash }, { file: Uri.file(previousFile.fsPath), hash: previousCommitHash });
        this.commandManager.executeCommand('vscode.diff', tmpFile, previousTmpFile, title, { preview: true });
    }
    public getFileCommitCommands(context: Context): ICommand[] {
        const commands: ICommand[] = [{
            data: context,
            label: '$(eye) View file contents',
            description: '',
            execute: () => this.commandManager.executeCommand('git.commit.file.viewFileContents', context)
        }, {
            data: context,
            label: '$(git-compare) Compare against workspace file',
            description: '',
            execute: () => this.commandManager.executeCommand('git.commit.file.compareAgainstWorkspace', context)
        }];

        if (context.committedFile!.status !== Status.Added) {
            commands.push({
                data: context,
                label: '$(git-compare) Compare against previous version',
                description: '',
                execute: () => this.commandManager.executeCommand('git.commit.file.compareAgainstPrevious', context)
            });
        }

        return commands;
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
    private async getFileUri(_gitService: IGitService, context: Context): Promise<Uri> {
        const args = [
            `workspaceFolder=${encodeURIComponent(context.workspaceFolder)}`,
            `hash=${context.hash.short}`,
            `fsPath=${encodeURIComponent(context.committedFile!.uri.fsPath)}`
        ];
        const ext = path.extname(context.committedFile!.relativePath);
        return Uri.parse(`${gitHistoryFileViewerSchema}://./${context.committedFile!.relativePath}.${context.hash.short}${ext}?${args.join('&')}`);
    }
}
