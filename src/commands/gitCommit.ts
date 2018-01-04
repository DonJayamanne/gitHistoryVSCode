import { inject, injectable } from 'inversify';
import { commands, Disposable } from 'vscode';
import { IUiService } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory, LogEntry } from '../types';
import { ICommitViewer } from '../viewers/types';
import { command } from './registration';
import { IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    private disposables: Disposable[] = [];
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

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
        const commandAction = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(workspaceFolder, logEntry);
        if (!commandAction) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(commandAction);
        commands.executeCommand(commandAction.command, ...commandAction.args);
    }
}
