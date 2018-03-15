import { IGitRebaseCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class RebaseCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitRebaseCommandHandler) {
        super(commit);
        this.setTitle(`$(git-merge) Rebase current branch onto this (${commit.logEntry.hash.short}) commit`);
        this.setCommand('git.commit.rebase');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.rebase(this.data);
    }
}
