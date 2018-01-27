import { IGitRevertCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class RevertCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitRevertCommandHandler) {
        super(commit);
        this.setTitle(`$(x) Revert this (${commit.logEntry.hash.short}) commit`);
        this.setCommand('git.commit.revert');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.revertCommit(this.data);
    }
}
