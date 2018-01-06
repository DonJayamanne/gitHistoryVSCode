import { inject, injectable } from 'inversify';
import { CommitData, ICommand, IUiService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { ICommitViewer } from '../viewers/types';
import { command } from './registration';
import { IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public async viewDetails(commit: CommitData) {
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        const logEntry = await gitService.getCommit(commit.logEntry.hash.full);
        if (!logEntry) {
            return;
        }
        this.serviceContainer.get<ICommitViewer>(ICommitViewer).showCommit(logEntry);
    }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(commit: CommitData) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(commit);
        if (!cmd) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(cmd);
        return cmd.execute();
    }
    public getCommitCommands(_context: CommitData): ICommand<CommitData>[] {
        return [];
    }
}
