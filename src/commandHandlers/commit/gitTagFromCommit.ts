import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitTagFromCommitCommandHandler } from '../types';

@injectable()
export class GitTagFromCommitCommandHandler implements IGitTagFromCommitCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    @command('git.commit.createTag', IGitTagFromCommitCommandHandler)
    public async createTagFromCommit(commit: CommitDetails, newTagName?: string) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const msg = 'Tag name';
        const description = 'Please provide a tag name';
        newTagName = (typeof newTagName !== 'string' || newTagName.trim().length === 0) ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description }) : newTagName;

        if (typeof newTagName !== 'string' || newTagName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.logEntry.gitRoot);
        gitService.createTag(newTagName, commit.logEntry.hash.full)
            .catch(async err => {
                this.applicationShell.showErrorMessage(err);
            });
    }
}
