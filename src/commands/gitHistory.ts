import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import { previewUri } from '../constants';
import { IServerHost } from '../server/types';
import { IGitServiceFactory, BranchSelection } from '../types';
import { IGitHistoryViewer } from './types';

@injectable()
export class GitHistory implements IGitHistoryViewer {
    constructor( @inject(IServerHost) private server: IServerHost,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IUiService) private uiService: IUiService) {
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
    }

    @command('git.viewHistory', IGitHistoryViewer)
    public async viewHistory() {
        const workspacefolder = await this.uiService.getWorkspaceFolder();
        if (!workspacefolder) {
            return undefined;
        }
        const branchSelection = await this.uiService.getBranchSelection();
        if (branchSelection === undefined) {
            return;
        }
        const gitService = await this.gitServiceFactory.createGitService(workspacefolder);
        const branchName = await gitService.getCurrentBranch();
        const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        const portAndId = await this.server.start(workspacefolder);
        const locale = process.env.language || '';
        const queryArgs = [
            `id=${portAndId.id}`, `port=${portAndId.port}`, `branchName=${encodeURIComponent(branchName)}`,
            `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
        ];
        const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
        return vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.One, title);
    }
}
