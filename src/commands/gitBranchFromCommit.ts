import { inject, injectable } from 'inversify';
import { Disposable, window } from 'vscode';
import { IApplicationShell } from '../application/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitBranchFromCommitCommandHandler } from './types';

@injectable()
export class GitBranchFromCommitCommandHandler implements IGitBranchFromCommitCommandHandler {
    private disposables: Disposable[] = [];
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.branch', IGitBranchFromCommitCommandHandler)
    public async createBranchFromCommit(workspaceFolder: string, hash: string) {
        const msg = 'Branch name';
        const description = 'Please provide a branch name';
        const newBranchName = await window.showInputBox({ placeHolder: msg, prompt: description });

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
}
