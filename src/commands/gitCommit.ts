import { injectable } from 'inversify';
import { Disposable } from 'vscode';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import {IServiceContainer} from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { ICommitViewer } from '../viewers/types';
import { IGitCommitCommandHandler } from './types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    private disposables: Disposable[] = [];
    constructor(private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.viewChangeLog', IGitCommitCommandHandler)
    public async viewHistory(workspaceFolder: string, branchName: string | undefined, hash: string) {
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        if (!logEntry) {
            return;
        }
        this.serviceContainer.get<ICommitViewer>(ICommitViewer).showCommit(logEntry);
    }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(workspaceFolder: string, branchName: string | undefined, hash: string) {
        const commandAction = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(hash);
        if (!commandAction) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(commandAction);
    }
}
