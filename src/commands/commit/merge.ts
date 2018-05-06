import { IGitMergeCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class MergeCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitMergeCommandHandler) {
        super(commit);
        this.setTitle(`$(git-merge) Merge this (${commit.logEntry.hash.short}) commit into current branch`);
        this.setCommand('git.commit.merge');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.merge(this.data);
    }
}
