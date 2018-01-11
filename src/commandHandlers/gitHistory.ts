import { inject, injectable } from 'inversify';
import * as osLocale from 'os-locale';
import { ViewColumn } from 'vscode';
import { IFileStatParser } from '../adapter/parsers/types';
import { ICommandManager } from '../application/types';
import { IDisposableRegistry } from '../application/types/disposableRegistry';
import { IUiService } from '../common/types';
import { previewUri } from '../constants';
import { IServiceContainer } from '../ioc/types';
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

    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewHistory(): Promise<void> {
        const fileStatParserFactory = this.serviceContainer.get<IFileStatParser>(IFileStatParser);

        // tslint:disable-next-line:no-console
        console.log(fileStatParserFactory);
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

        const branchNamePromise = await gitService.getCurrentBranch();
        const startupInfoPromise = await this.server!.start(workspaceFolder);
        const localePromise = await osLocale();

        const [branchName, startupInfo, locale] = await Promise.all([branchNamePromise, startupInfoPromise, localePromise]);

        const id = Date.now().toString();
        await this.serviceContainer.get<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore).initialize(id, workspaceFolder, branchName, branchSelection);

        const queryArgs = [
            `id=${id}`, `port=${startupInfo.port}`,
            `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
        ];
        if (branchSelection === BranchSelection.Current) {
            queryArgs.push(`branchName=${encodeURIComponent(branchName)}`);
        }
        const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
        const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        this.commandManager.executeCommand('vscode.previewHtml', uri, ViewColumn.One, title);
    }
}
