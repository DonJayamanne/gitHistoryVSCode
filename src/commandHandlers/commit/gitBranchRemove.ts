import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { BranchDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { command } from '../registration';
import { IGitBranchRemoveCommandHandler } from '../types';

@injectable()
export class GitBranchRemoveCommandHandler implements IGitBranchRemoveCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    @command('git.commit.removeBranch', IGitBranchRemoveCommandHandler)
    public async removeBranchFromCommit(branch: BranchDetails, branchName?: string) {
        
        const msg = 'Branch to remove';
        const description = 'Enter branch name to remove';

        branchName = (typeof branchName !== 'string' || branchName.trim().length === 0) ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description }) : branchName;

        if (typeof branchName !== 'string' || branchName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(branch.workspaceFolder);
        gitService.removeBranch(branchName).catch(async err => {
            this.applicationShell.showErrorMessage(err);
        });
    }
}
