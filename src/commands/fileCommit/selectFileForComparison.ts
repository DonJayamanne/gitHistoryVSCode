import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { FileCommitContext } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class SelectFileForComparison extends BaseFileCommitCommand {
    constructor(context: FileCommitContext, private handler: IGitCompareCommandHandler) {
        super(context);
        this.setLabel('$(git-compare) Select for comparison');
    }
    public execute() {
        this.handler.selectCommit(this.data);
    }
}
