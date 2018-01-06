import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithPreviousCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setLabel('$(git-compare) Compare against previous version');
    }
    public execute() {
        this.handler.compareFileWithPrevious(this.data);
    }
}
