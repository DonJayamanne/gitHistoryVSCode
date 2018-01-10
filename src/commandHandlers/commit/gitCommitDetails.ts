import { inject, injectable } from 'inversify';
import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { ICommitViewerFactory } from '../../viewers/types';
import { IGitCommitViewDetailsCommandHandler } from '../types';

@injectable()
export class GitCommitViewDetailsCommandHandler implements IGitCommitViewDetailsCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    public async viewDetails(commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.selected', true);
        this.serviceContainer.get<ICommitViewerFactory>(ICommitViewerFactory).getCommitViewer().showCommit(commit);
    }

    public async viewCommitTree(commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.selected', true);
        this.serviceContainer.get<ICommitViewerFactory>(ICommitViewerFactory).getCommitViewer().showCommitTree(commit);
    }
}
