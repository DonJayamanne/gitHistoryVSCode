import { ICommandManager } from '../../application/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewFileHistoryCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private commandManager: ICommandManager) {
        super(fileCommit);
        this.setTitle('$(history) View file history');
        this.setCommand('git.viewFileHistory');
        this.setCommandArguments([fileCommit]);
    }
    public execute() {
        this.commandManager.executeCommand(this.command, ...this.arguments);
    }
}
