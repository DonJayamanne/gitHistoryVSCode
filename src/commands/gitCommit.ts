import { inject, injectable } from 'inversify';
import { ICommand, IUiService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory, LogEntry } from '../types';
import { ICommitViewer } from '../viewers/types';
import { command } from './registration';
import { ICommitCommandBuilder, IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler, ICommitCommandBuilder {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    @command('git.commit.viewChangeLog', IGitCommitCommandHandler)
    public async viewHistory(workspaceFolder: string, _branchName: string | undefined, hash: string) {
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        if (!logEntry) {
            return;
        }
        this.serviceContainer.get<ICommitViewer>(ICommitViewer).showCommit(logEntry);
    }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(workspaceFolder: string, _branchName: string | undefined, logEntry: LogEntry) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(workspaceFolder, logEntry);
        if (!cmd) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(cmd);
        return cmd.execute();
    }
    public getCommitCommands(_workspaceFolder: string, _branchName: string | undefined, _logEntry: LogEntry): ICommand[] {
        return [];
    }
}
