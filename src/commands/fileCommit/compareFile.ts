import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { FileCommitData } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitData, private handler: IGitCompareCommandHandler, leftCommit: FileCommitData) {
        super(fileCommit);
        this.setLabel(`$(git-compare) Compare with ${leftCommit.logEntry.hash.short}`);

    }
    public execute() {
        this.handler.compare(this.data);
    }
}
