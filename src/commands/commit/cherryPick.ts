import { IGitCherryPickCommandHandler } from '../../commandHandlers/types';
import { CommitData } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CherryPickCommand extends BaseCommitCommand {
    constructor(commit: CommitData, private handler: IGitCherryPickCommandHandler) {
        super(commit);
        this.setLabel(`$(git-pull-request) Cherry pick ${commit.logEntry.hash.short} into current branch`);

    }
    public execute() {
        this.handler.cherryPickCommit(this.data);
    }
}
