import { inject, injectable } from 'inversify';
import { CommitDetails, IUiService } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitCommitCommandHandler } from '../types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory) { }

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(commit: CommitDetails) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(commit);
        if (cmd) {
            return cmd.execute();
        }
    }
    @command('git.commit.selected', IGitCommitCommandHandler)
    public onCommitSelected(commit: CommitDetails) {
        const viewer = this.commitViewerFactory.getCommitViewer();
        viewer.showCommit(commit);
        viewer.showCommitTree(commit);
    }
}
