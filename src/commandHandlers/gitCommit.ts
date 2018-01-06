import { inject, injectable } from 'inversify';
import { CommitContext, ICommand, IUiService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { ICommitViewer } from '../viewers/types';
import { command } from './registration';
import { IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    @command('git.commit.viewChangeLog', IGitCommitCommandHandler)
    public async viewHistory(context: CommitContext) {
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const logEntry = await gitService.getCommit(context.logEntry.hash.full);
        if (!logEntry) {
            return;
        }
        this.serviceContainer.get<ICommitViewer>(ICommitViewer).showCommit(logEntry);
    }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(context: CommitContext) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(context);
        if (!cmd) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(cmd);
        return cmd.execute();
    }
    public getCommitCommands(_context: CommitContext): ICommand<CommitContext>[] {
        return [];
    }
}
