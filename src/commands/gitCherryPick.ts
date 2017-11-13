import { injectable } from 'inversify';
import { Disposable, window } from 'vscode';
import { command } from '../commands/register';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { IGitCherryPickCommandHandler } from './types';

@injectable()
export class GitCherryPickCommandHandler implements IGitCherryPickCommandHandler {
    private disposables: Disposable[] = [];
    constructor(private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.cherryPick', IGitCherryPickCommandHandler)
    public async cherryPickCommit(workspaceFolder: string, _branchName: string | undefined, hash: string) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const currentBranchPromise = gitService.getCurrentBranch();
        const hashInfoPromise = gitService.getHash(hash);
        const values = await Promise.all([currentBranchPromise, hashInfoPromise]);

        const currentBranch = values[0];
        const hashInfo = values[1];
        const msg = `Cherry pick ${hashInfo.short} into ${currentBranch}?`;
        const yesNo = await window.showQuickPick(['Yes', 'No'], { placeHolder: msg });

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.cherryPick(hash)
            .catch(err => {
                if (typeof err === 'string') {
                    window.showErrorMessage(err);
                }
            });
    }
}
