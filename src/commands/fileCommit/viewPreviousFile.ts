import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { Status } from '../../types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class ViewPreviousFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setTitle('$(eye) View previous file contents');
        this.setCommand('git.commit.FileEntry.ViewPreviousFileContents');
        this.setCommandArguments([fileCommit]);
    }
    public async preExecute(): Promise<boolean> {
        return this.data.committedFile.status === Status.Deleted;
    }
    public execute() {
        this.handler.viewFile(this.data);
    }
}
