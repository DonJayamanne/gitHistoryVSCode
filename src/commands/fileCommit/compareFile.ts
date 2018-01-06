import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitCompareCommandHandler, leftCommit: FileCommitDetails) {
        super(fileCommit);
        this.setLabel(`$(git-compare) Compare with ${leftCommit.logEntry.hash.short}`);

    }
    public execute() {
        this.handler.compare(this.data);
    }
}
