import { injectable } from 'inversify';
import { Disposable, window } from 'vscode';
import { command } from '../commands/register';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { IGitCompareCommandHandler } from './types';

@injectable()
export class GitCompareCommandHandler implements IGitCompareCommandHandler {
    private disposables: Disposable[] = [];
    constructor(private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.selectForComparisonxxx', IGitCompareCommandHandler)
    public async onCommitSelected(workspaceFolder: string, _branchName: string | undefined, hash: string) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        // this.previouslySelectedHash = await gitService.getHash(hash);
    }
}
