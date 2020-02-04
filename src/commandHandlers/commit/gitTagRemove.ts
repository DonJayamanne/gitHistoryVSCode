import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { BranchDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { command } from '../registration';
import { IGitTagRemoveCommandHandler } from '../types';

@injectable()
export class GitTagRemoveCommandHandler implements IGitTagRemoveCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    @command('git.commit.removeTag', IGitTagRemoveCommandHandler)
    public async removeTagFromCommit(branch: BranchDetails, tagName?: string) {
        
        const msg = 'Tag to remove';
        const description = 'Enter tag name to remove';

        tagName = (typeof tagName !== 'string' || tagName.trim().length === 0) ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description }) : tagName;

        if (typeof tagName !== 'string' || tagName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(branch.workspaceFolder, branch.workspaceFolder);
        gitService.removeTag(tagName).catch(async err => {
            this.applicationShell.showErrorMessage(err);
        });
    }
}
