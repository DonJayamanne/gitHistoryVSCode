import { inject, injectable } from 'inversify';
import { IApplicationShell, ICommandManager } from '../application/types';
import { ICommand } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { Hash, IGitServiceFactory, LogEntry } from '../types';
import { command } from './registration';
import { ICommitCommandBuilder, IGitCherryPickCommandHandler } from './types';

@injectable()
export class GitCherryPickCommandHandler implements IGitCherryPickCommandHandler, ICommitCommandBuilder {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    @command('git.commit.cherryPick', IGitCherryPickCommandHandler)
    public async cherryPickCommit(workspaceFolder: string, hash: Hash) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const currentBranch = await gitService.getCurrentBranch();

        const msg = `Cherry pick ${hash.short} into ${currentBranch}?`;
        const yesNo = await this.applicationShell.showQuickPick(['Yes', 'No'], { placeHolder: msg });

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.cherryPick(hash.full)
            .catch(err => {
                if (typeof err === 'string') {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
    public getCommitCommands(workspaceFolder: string, _branchName: string | undefined, logEntry: LogEntry): ICommand[] {
        return [{
            label: `$(git-pull-request) Cherry pick ${logEntry.hash.short} into current branch`,
            description: '',
            execute: () => {
                this.commandManager.executeCommand('git.commit.cherryPick', workspaceFolder, logEntry.hash);
            }
        }];
    }
}
