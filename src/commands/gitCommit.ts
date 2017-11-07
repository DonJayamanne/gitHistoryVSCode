import { inject, injectable } from 'inversify';
import { command } from '../commands/register';
import { IServerHost } from '../server/types';
import { IGitServiceFactory } from '../types';
import { ICommitViewer } from '../viewers/types';
import { IGitCommitCommandHandler } from './types';
import { IUiService } from '../common/types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServerHost) private server: IServerHost,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IUiService) private uiService: IUiService,
        @inject(ICommitViewer) private commitViewer: ICommitViewer) {
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
    }

    @command('git.commit.viewChangeLog', IGitCommitCommandHandler)
    public async viewHistory(workspaceFolder: string, branchName: string | undefined, hash: string) {
        const gitService = await this.gitServiceFactory.createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        if (!logEntry) {
            return;
        }
        this.commitViewer.showCommit(logEntry);
    }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(workspaceFolder: string, branchName: string | undefined, hash: string) {
        const commandAction = await this.uiService.selectCommitCommandAction(hash);
        if (!commandAction) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(commandAction);
    }
}
