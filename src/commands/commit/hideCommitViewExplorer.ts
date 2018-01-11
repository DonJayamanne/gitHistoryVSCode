import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class HideCommitViewExplorerCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private commandManager: ICommandManager) {
        super(commit);
        this.setTitle('Hide Commit View Explorer');
        this.setCommand('git.commit.view.hide');
    }
    public execute() {
        this.commandManager.executeCommand(this.command);
    }
}
