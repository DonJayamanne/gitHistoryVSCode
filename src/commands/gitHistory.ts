import { inject, injectable } from 'inversify';
import { commands, ViewColumn } from 'vscode';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import { previewUri } from '../constants';
import { IServerHost, IWorkspaceQueryStateStore } from '../server/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { IGitHistoryCommandHandler } from './types';

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    constructor( @inject(IServerHost) private server: IServerHost,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IUiService) private uiService: IUiService,
        @inject(IWorkspaceQueryStateStore) private stateStore: IWorkspaceQueryStateStore) {
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
    }

    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewHistory() {
        const workspaceFolder = await this.uiService.getWorkspaceFolder();
        if (!workspaceFolder) {
            return undefined;
        }
        const branchSelection = await this.uiService.getBranchSelection();
        if (branchSelection === undefined) {
            return;
        }
        const gitService = await this.gitServiceFactory.createGitService(workspaceFolder);
        const branchName = await gitService.getCurrentBranch();
        const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        const startupInfo = await this.server.start(workspaceFolder);
        const id = Date.now().toString();
        await this.stateStore.initialize(id, workspaceFolder, branchName, branchSelection);
        const locale = process.env.language || '';
        const queryArgs = [
            `id=${id}`, `port=${startupInfo.port}`,
            `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
        ];
        if (branchSelection === BranchSelection.Current) {
            queryArgs.push(`branchName=${encodeURIComponent(branchName)}`);
        }
        const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
        return commands.executeCommand('vscode.previewHtml', uri, ViewColumn.One, title);
    }
}
