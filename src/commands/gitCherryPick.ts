import { inject, injectable } from 'inversify';
import { Disposable, window } from 'vscode';
import { IServiceContainer } from '../ioc/types';
import { Hash, IGitServiceFactory } from '../types';
import { command } from './registration';
import { IGitCherryPickCommandHandler } from './types';

@injectable()
export class GitCherryPickCommandHandler implements IGitCherryPickCommandHandler {
    private disposables: Disposable[] = [];
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        // this.disposables.push(commands.registerCommand('git.commit.viewChangeLog', this.viewHistory, this));
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.commit.cherryPick', IGitCherryPickCommandHandler)
    public async cherryPickCommit(workspaceFolder: string, hash: Hash) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const currentBranch = await gitService.getCurrentBranch();

        const msg = `Cherry pick ${hash.short} into ${currentBranch}?`;
        const yesNo = await window.showQuickPick(['Yes', 'No'], { placeHolder: msg });

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.cherryPick(hash.full)
            .catch(err => {
                if (typeof err === 'string') {
                    window.showErrorMessage(err);
                }
            });
    }
}
