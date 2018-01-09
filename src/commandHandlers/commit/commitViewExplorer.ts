import { inject, injectable } from 'inversify';
import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { command } from '../registration';
import { IGitCommitViewExplorerCommandHandler } from '../types';

@injectable()
export class GitCommitViewExplorerCommandHandler implements IGitCommitViewExplorerCommandHandler {
    constructor( @inject(ICommandManager) private commandManager: ICommandManager) { }

    @command('git.commitView.hide', IGitCommitViewExplorerCommandHandler)
    public async hideCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commitView.show', false);
    }

    @command('git.commitView.show', IGitCommitViewExplorerCommandHandler)
    public async showCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commitView.show', true);
    }
}
