import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitContext } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithWorkspaceCommand extends BaseFileCommitCommand {
    constructor(context: FileCommitContext, private handler: IGitFileHistoryCommandHandler) {
        super(context);
        this.setLabel('$(git-compare) Compare against workspace file');
    }
    public execute() {
        this.handler.compareFileWithWorkspace(this.data);
    }
}
