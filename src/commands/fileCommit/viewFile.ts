import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setLabel('$(eye) View file contents');
    }
    public execute() {
        this.handler.viewFile(this.data);
    }
}
