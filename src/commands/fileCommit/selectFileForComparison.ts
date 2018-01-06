import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class SelectFileForComparison extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitCompareCommandHandler) {
        super(fileCommit);
        this.setLabel('$(git-compare) Select for comparison');
    }
    public execute() {
        this.handler.selectCommit(this.data);
    }
}
