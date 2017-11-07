import { inject, injectable } from 'inversify';
import { command } from '../commands/register';
import { IServerHost } from '../server/types';
import { IGitServiceFactory } from '../types';
import { ICommitViewer } from '../viewers/types';
import { IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServerHost) private server: IServerHost,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
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
}
