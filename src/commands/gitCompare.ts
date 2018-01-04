import { inject, injectable } from 'inversify';
import { commands, Disposable } from 'vscode';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory, LogEntry } from '../types';
import { command } from './registration';
import { IGitCompareCommandHandler } from './types';

@injectable()
export class GitCompareCommandHandler implements IGitCompareCommandHandler {
    private disposables: Disposable[] = [];
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.compareWithSelected', IGitCompareCommandHandler)
    public async onCommitSelected(workspaceFolder: string, left: LogEntry, right: LogEntry) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const fileDiffs = await gitService.getDifferences(left.hash.full, right.hash.full);
        commands.executeCommand('git.commit.diff.view', workspaceFolder, left, right, fileDiffs);
    }
}
