import { inject, injectable } from 'inversify';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewer } from '../../viewers/types';
import { IGitCommitViewDetailsCommandHandler } from '../types';

@injectable()
export class GitCommitViewDetailsCommandHandler implements IGitCommitViewDetailsCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public async viewDetails(commit: CommitDetails) {
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        const logEntry = await gitService.getCommit(commit.logEntry.hash.full);
        if (!logEntry) {
            return;
        }
        this.serviceContainer.get<ICommitViewer>(ICommitViewer).showCommit(logEntry);
    }
}
