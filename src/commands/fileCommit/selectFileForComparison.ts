import { IGitCompareFileCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class SelectFileForComparison extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitCompareFileCommandHandler) {
        super(fileCommit);
        this.setTitle('$(git-compare) Select for comparison');
        this.setCommand('git.commit.FileEntry.selectForComparison');
        this.setCommandArguments([fileCommit]);
    }
    public execute() {
        this.handler.selectFile(this.data);
    }
}
