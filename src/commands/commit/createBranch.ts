import { IGitBranchFromCommitCommandHandler } from '../../commandHandlers/types';
import { CommitContext } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CreateBranchCommand extends BaseCommitCommand {
    constructor(context: CommitContext, private handler: IGitBranchFromCommitCommandHandler) {
        super(context);
        this.setLabel(`$(git-branch) Branch from ${context.logEntry.hash.short}`);

    }
    public execute() {
        this.handler.createBranchFromCommit (this.data);
    }
}
