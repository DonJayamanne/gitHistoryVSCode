import { inject, injectable } from 'inversify';
import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { ICommitViewer } from '../../viewers/types';
import { command } from '../registration';
import { IGitCommitViewExplorerCommandHandler } from '../types';

@injectable()
export class GitCommitViewExplorerCommandHandler implements IGitCommitViewExplorerCommandHandler {
    constructor( @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(ICommitViewer) private commitViewer: ICommitViewer) { }

    @command('git.commitView.hide', IGitCommitViewExplorerCommandHandler)
    public async hideCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commitView.show', false);
    }

    @command('git.commitView.show', IGitCommitViewExplorerCommandHandler)
    public async showCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commitView.show', true);
    }

    @command('git.commit.commitView.showFilesOnly', IGitCommitViewExplorerCommandHandler)
    public async showFilesView(_commit: CommitDetails) {
        this.commitViewer.showFilesView();
    }

    @command('git.commit.commitView.showFolderView', IGitCommitViewExplorerCommandHandler)
    public async showFolderView(_commit: CommitDetails) {
        this.commitViewer.showFolderView();
    }
}
