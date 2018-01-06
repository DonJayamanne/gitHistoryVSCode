import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitContext } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithPreviousCommand extends BaseFileCommitCommand {
    constructor(context: FileCommitContext, private handler: IGitFileHistoryCommandHandler) {
        super(context);
        this.setLabel('$(git-compare) Compare against previous version');
    }
    public execute() {
        this.handler.compareFileWithPrevious(this.data);
    }
}
