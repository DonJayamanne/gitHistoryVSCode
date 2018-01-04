import { inject, injectable } from 'inversify';
import { IApplicationShell, ICommandManager } from '../application/types';
import { ICommand } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory, LogEntry } from '../types';
import { command } from './registration';
import { ICommitCommandBuilder, IGitBranchFromCommitCommandHandler } from './types';

@injectable()
export class GitBranchFromCommitCommandHandler implements IGitBranchFromCommitCommandHandler, ICommitCommandBuilder {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    @command('git.commit.branch', IGitBranchFromCommitCommandHandler)
    public async createBranchFromCommit(workspaceFolder: string, hash: string) {
        const msg = 'Branch name';
        const description = 'Please provide a branch name';
        const newBranchName = await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description });

        if (typeof newBranchName !== 'string' || newBranchName.length === 0) {
            return;
        }

        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        gitService.createBranch(newBranchName, hash)
            .catch(async err => {
                const currentBranchName = await gitService.getCurrentBranch();
                if (typeof err === 'string' && currentBranchName !== newBranchName) {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
    public getCommitCommands(workspaceFolder: string, _branchName: string | undefined, logEntry: LogEntry): ICommand[] {
        return [{
            label: `$(git-branch) Branch from ${logEntry.hash.short}`,
            description: '',
            execute: () => {
                this.commandManager.executeCommand('git.commit.branch', workspaceFolder, logEntry.hash.full);
            }
        }];
    }
}
