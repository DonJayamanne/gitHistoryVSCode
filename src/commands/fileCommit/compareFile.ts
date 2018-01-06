import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { FileCommitContext } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileCommand extends BaseFileCommitCommand {
    constructor(context: FileCommitContext, private handler: IGitCompareCommandHandler, leftCommit: FileCommitContext) {
        super(context);
        this.setLabel(`$(git-compare) Compare with ${leftCommit.logEntry.hash.short}`);

    }
    public execute() {
        this.handler.compare(this.data);
    }
}
