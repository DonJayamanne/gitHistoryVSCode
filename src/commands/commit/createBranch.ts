import { IGitBranchFromCommitCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CreateBranchCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitBranchFromCommitCommandHandler) {
        super(commit);
        this.setTitle(`$(git-branch) Branch from ${commit.logEntry.hash.short}`);
        this.setCommand('git.commit.createBranch');
        this.setCommandArguments([commit]);

    }
    public execute() {
        this.handler.createBranchFromCommit(this.data);
    }
}
