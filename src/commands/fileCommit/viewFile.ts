import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitData } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitData, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setLabel('$(eye) View file contents');
    }
    public execute() {
        this.handler.viewFile(this.data);
    }
}
