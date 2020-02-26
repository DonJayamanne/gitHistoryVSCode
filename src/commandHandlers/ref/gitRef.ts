import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { BranchDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { command } from '../registration';
import { IGitRefCommandHandler } from '../types';

@injectable()
export class GitRefCommandHandler implements IGitRefCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell)  { }

    @command('git.commit.removeTag', IGitRefCommandHandler)
    public async removeTagFromCommit(branch: BranchDetails, tagName?: string) {
        const msg = 'Tag to remove';
        const description = 'Enter tag name to remove';

        tagName = (typeof tagName !== 'string' || tagName.trim().length === 0) ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description }) : tagName;

        if (typeof tagName !== 'string' || tagName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(branch.workspaceFolder);
        gitService.removeTag(tagName).catch(async err => {
            this.applicationShell.showErrorMessage(err);
        });
    }

    @command('git.commit.removeBranch', IGitRefCommandHandler)
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

    @command('git.commit.removeRemote', IGitRefCommandHandler)
    public async removeRemoteFromCommit(branch: BranchDetails, remoteName?: string) {
        const msg = 'Remote branch to remove';
        const description = 'Enter remote branch to remove';

        remoteName = (typeof remoteName !== 'string' || remoteName.trim().length === 0) ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description }) : remoteName;

        if (typeof remoteName !== 'string' || remoteName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(branch.workspaceFolder);
        gitService.removeRemoteBranch(remoteName).catch(async err => {
            this.applicationShell.showErrorMessage(err.stderr);
        });
    }
}
