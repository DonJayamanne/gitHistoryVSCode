import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../application/types';
import { CommitDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { IGitCherryPickCommandHandler } from './types';

@injectable()
export class GitCherryPickCommandHandler implements IGitCherryPickCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    public async cherryPickCommit(commit: CommitDetails) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        const currentBranch = await gitService.getCurrentBranch();

        const msg = `Cherry pick ${commit.logEntry.hash.short} into ${currentBranch}?`;
        const yesNo = await this.applicationShell.showQuickPick(['Yes', 'No'], { placeHolder: msg });

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.cherryPick(commit.logEntry.hash.full)
            .catch(err => {
                if (typeof err === 'string') {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
}
