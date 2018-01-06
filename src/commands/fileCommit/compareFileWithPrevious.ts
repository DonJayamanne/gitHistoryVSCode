import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitData } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithPreviousCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitData, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setLabel('$(git-compare) Compare against previous version');
    }
    public execute() {
        this.handler.compareFileWithPrevious(this.data);
    }
}
