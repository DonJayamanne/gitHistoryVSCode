import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../application/types';
import { CommitContext } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { IGitCherryPickCommandHandler } from './types';

@injectable()
export class GitCherryPickCommandHandler implements IGitCherryPickCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    public async cherryPickCommit(context: CommitContext) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const currentBranch = await gitService.getCurrentBranch();

        const msg = `Cherry pick ${context.logEntry.hash.short} into ${currentBranch}?`;
        const yesNo = await this.applicationShell.showQuickPick(['Yes', 'No'], { placeHolder: msg });

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.cherryPick(context.logEntry.hash.full)
            .catch(err => {
                if (typeof err === 'string') {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
}
