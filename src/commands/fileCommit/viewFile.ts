import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitContext } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewFileCommand extends BaseFileCommitCommand {
    constructor(context: FileCommitContext, private handler: IGitFileHistoryCommandHandler) {
        super(context);
        this.setLabel('$(eye) View file contents');
    }
    public execute() {
        this.handler.viewFile(this.data);
    }
}
