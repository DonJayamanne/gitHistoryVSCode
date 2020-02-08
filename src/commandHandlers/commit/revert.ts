import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitRevertCommandHandler } from '../types';

@injectable()
export class GitRevertCommandHandler implements IGitRevertCommandHandler {
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    @command('git.commit.revert', IGitRevertCommandHandler)
    public async revertCommit(commit: CommitDetails, showPrompt: boolean = true) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.logEntry.gitRoot);

        const msg = `Are you sure you want to revert this '${commit.logEntry.hash.short}' commit?`;
        const yesNo = showPrompt ? await this.applicationShell.showQuickPick(['Yes', 'No'], { placeHolder: msg }) : 'Yes';

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.revertCommit(commit.logEntry.hash.full)
            .catch(err => {
                if (typeof err === 'string') {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
}
