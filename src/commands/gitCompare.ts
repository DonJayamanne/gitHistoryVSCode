import { inject, injectable } from 'inversify';
import { ICommandManager } from '../application/types';
import { ICommand } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory, LogEntry } from '../types';
import { command } from './registration';
import { ICommitCommandBuilder, IGitCompareCommandHandler } from './types';

@injectable()
export class GitCompareCommandHandler implements IGitCompareCommandHandler, ICommitCommandBuilder {
    private previouslySelectedCommit?: LogEntry;
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    @command('git.commit.compareWithSelected', IGitCompareCommandHandler)
    public async onCommitSelected(workspaceFolder: string, left: LogEntry, right: LogEntry) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const fileDiffs = await gitService.getDifferences(left.hash.full, right.hash.full);
        this.commandManager.executeCommand('git.commit.diff.view', workspaceFolder, left, right, fileDiffs);
    }
    public getCommitCommands(workspaceFolder: string, _branchName: string | undefined, logEntry: LogEntry): ICommand[] {
        const commands: ICommand[] = [{
            label: '$(git-compare) Select for comparison',
            description: '', detail: 'blah blah',
            execute: () => { this.previouslySelectedCommit = logEntry; }
        }];

        if (this.previouslySelectedCommit) {
            const label = `$(git-compare) Compare with ${this.previouslySelectedCommit.hash.short}`;
            const description = this.previouslySelectedCommit.subject;
            commands.push({
                label, description, detail: 'blah blah',
                execute: () => this.onCommitSelected(workspaceFolder, this.previouslySelectedCommit!, logEntry)
            });
        }

        return commands;
    }
}
