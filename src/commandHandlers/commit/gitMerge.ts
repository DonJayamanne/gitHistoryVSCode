import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitMergeCommandHandler } from '../types';

@injectable()
export class GitMergeCommandHandler implements IGitMergeCommandHandler {
    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @inject(IApplicationShell) private applicationShell: IApplicationShell,
    ) {}

    @command('git.commit.merge', IGitMergeCommandHandler)
    public async merge(commit: CommitDetails, showPrompt = true) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const gitService = await this.serviceContainer
            .get<IGitServiceFactory>(IGitServiceFactory)
            .createGitService(commit.workspaceFolder);
        const currentBranch = await gitService.getCurrentBranch();

        const commitBranches = (await gitService.getRefsContainingCommit(commit.logEntry.hash.full)).filter(
            value => value.length > 0,
        );
        const branchMsg = `Choose the commit/branch to merge into ${currentBranch}`;
        const rev = await this.applicationShell.showQuickPick([commit.logEntry.hash.full, ...commitBranches], {
            placeHolder: branchMsg,
        });

        let type: string;
        if (rev === undefined || rev.length === 0) {
            return;
        }
        if (rev === commit.logEntry.hash.full) {
            type = 'commit';
        } else {
            type = 'branch';
        }

        const msg = `Merge ${type} '${rev}' into ${currentBranch}?`;
        const yesNo = showPrompt
            ? await this.applicationShell.showQuickPick(['Yes', 'No'], { placeHolder: msg })
            : 'Yes';

        if (yesNo === undefined || yesNo === 'No') {
            return;
        }

        gitService.merge(rev).catch(err => {
            if (typeof err === 'string') {
                this.applicationShell.showErrorMessage(err);
            }
        });
    }
}
