import { IGitCherryPickCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CherryPickCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCherryPickCommandHandler) {
        super(commit);
        this.setTitle(`$(git-pull-request) Cherry pick ${commit.logEntry.hash.short} into current branch`);

    }
    public execute() {
        this.handler.cherryPickCommit(this.data);
    }
}
