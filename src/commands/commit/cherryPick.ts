import { IGitCherryPickCommandHandler } from '../../commandHandlers/types';
import { CommitContext } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CherryPickCommand extends BaseCommitCommand {
    constructor(context: CommitContext, private handler: IGitCherryPickCommandHandler) {
        super(context);
        this.setLabel(`$(git-pull-request) Cherry pick ${context.logEntry.hash.short} into current branch`);

    }
    public execute() {
        this.handler.cherryPickCommit(this.data);
    }
}
