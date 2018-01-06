import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitData } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithWorkspaceCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitData, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setLabel('$(git-compare) Compare against workspace file');
    }
    public execute() {
        this.handler.compareFileWithWorkspace(this.data);
    }
}
