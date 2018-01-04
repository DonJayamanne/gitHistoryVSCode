import { inject, injectable } from 'inversify';
import * as osLocale from 'os-locale';
import { commands, Disposable, ViewColumn } from 'vscode';
import { IFileStatParser } from '../adapter/parsers/types';
import { IUiService } from '../common/types';
import { previewUri } from '../constants';
import { IServiceContainer } from '../ioc/types';
import { IServerHost, IWorkspaceQueryStateStore } from '../server/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitHistoryCommandHandler } from './types';

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    private disposables: Disposable[] = [];
    private server: IServerHost;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.viewHistory', this.viewHistory, this));
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewHistory(): Promise<void> {
        const fileStatParserFactory = this.serviceContainer.get<IFileStatParser>(IFileStatParser);

        // tslint:disable-next-line:no-console
        console.log(fileStatParserFactory);
        this.server = this.server || this.serviceContainer.get<IServerHost>(IServerHost);
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
        const startupInfoPromise = await this.server.start(workspaceFolder);
        const localePromise = await osLocale();

        const values = await Promise.all([branchNamePromise, startupInfoPromise, localePromise]);
        const branchName = values[0];
        const startupInfo = values[1];
        const locale = values[2];

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
        commands.executeCommand('vscode.previewHtml', uri, ViewColumn.One, title);
    }
}
