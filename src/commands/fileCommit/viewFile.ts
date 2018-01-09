import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { Status } from '../../types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setTitle('$(eye) View file contents');
        this.setCommand('git.commit.FileEntry.ViewFileContents');
        this.setCommandArguments([fileCommit]);
    }
    public preExecute(): boolean {
        return this.data.committedFile!.status !== Status.Deleted;
    }
    public execute() {
        this.handler.viewFile(this.data);
    }
}
