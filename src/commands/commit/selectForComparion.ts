import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class SelectForComparison extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCompareCommandHandler) {
        super(commit);
        this.setTitle('$(git-compare) Select for comparison');
        this.setCommand('git.commit.selectForComparison');
        this.setCommandArguments([CommitDetails]);
    }
    public execute() {
        this.handler.select(this.data);
    }
}
