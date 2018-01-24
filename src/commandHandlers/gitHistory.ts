import { inject, injectable } from 'inversify';
import * as md5 from 'md5';
import * as osLocale from 'os-locale';
import * as path from 'path';
import { Uri, ViewColumn, window } from 'vscode';
import { IFileStatParser } from '../adapter/parsers/types';
import { ICommandManager } from '../application/types';
import { IDisposableRegistry } from '../application/types/disposableRegistry';
import { FileCommitDetails, IUiService } from '../common/types';
import { previewUri } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { FileNode } from '../nodes/types';
import { IServerHost, IWorkspaceQueryStateStore } from '../server/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitHistoryCommandHandler } from './types';

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    private _server: IServerHost;
    private get server(): IServerHost {
        if (!this._server) {
            this._server = this.serviceContainer.get<IServerHost>(IServerHost);
            this.disposableRegistry.register(this._server);
        }
        return this._server;
    }
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IDisposableRegistry) private disposableRegistry: IDisposableRegistry,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    @command('git.viewFileHistory', IGitHistoryCommandHandler)
    public async viewFileHistory(info?: FileCommitDetails | Uri): Promise<void> {
        let fileUri: Uri | undefined;
        if (info) {
            if (info instanceof FileCommitDetails) {
                const committedFile = info.committedFile;
                fileUri = committedFile.uri ? Uri.file(committedFile.uri!.fsPath!) : Uri.file(committedFile.oldUri!.fsPath);
            } else if (info instanceof FileNode) {
                const committedFile = info.data!.committedFile;
                fileUri = committedFile.uri ? Uri.file(committedFile.uri!.fsPath!) : Uri.file(committedFile.oldUri!.fsPath);
            } else if (info instanceof Uri) {
                fileUri = info;
                // tslint:disable-next-line:no-any
            } else if ((info as any).resourceUri) {
                // tslint:disable-next-line:no-any
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
    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewBranchHistory(): Promise<void> {
        return this.viewHistory();
    }

    public async viewHistory(fileUri?: Uri): Promise<void> {
        const uiService = this.serviceContainer.get<IUiService>(IUiService);
        const workspaceFolder = await uiService.getWorkspaceFolder();
        if (!workspaceFolder) {
            return undefined;
        }
        const branchSelection = await uiService.getBranchSelection();
        if (branchSelection === undefined) {
            return;
        }
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);

        const branchNamePromise = branchSelection === BranchSelection.All ? Promise.resolve('') : gitService.getCurrentBranch();
        const startupInfoPromise = this.server!.start(workspaceFolder);
        const localePromise = osLocale();

        const [branchName, startupInfo, locale] = await Promise.all([branchNamePromise, startupInfoPromise, localePromise]);

        // Do not include the search string into this
        const fullId = `${startupInfo.port}:${branchSelection}:${fileUri ? fileUri.fsPath : ''}`;
        const id = md5(fullId); //Date.now().toString();
        await this.serviceContainer.get<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore).initialize(id, workspaceFolder, branchName, branchSelection, '', fileUri);

        const queryArgs = [
            `id=${id}`, `port=${startupInfo.port}`,
            `file=${fileUri ? encodeURIComponent(fileUri.fsPath) : ''}`,
            `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
        ];
        if (branchSelection === BranchSelection.Current) {
            queryArgs.push(`branchName=${encodeURIComponent(branchName)}`);
        }
        // const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
        const uri = `${previewUri}?${queryArgs.join('&')}`;
        let title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        if (fileUri) {
            title = `File History (${path.basename(fileUri.fsPath)})`;
        }
        this.commandManager.executeCommand('vscode.previewHtml', uri, ViewColumn.One, title);
    }
}
