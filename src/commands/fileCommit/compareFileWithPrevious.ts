import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { Status } from '../../types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithPreviousCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setTitle('$(git-compare) Compare against previous version');
        this.setCommand('git.commit.FileEntry.CompareAgainstPrevious');
        this.setCommandArguments([fileCommit]);
    }
    public preExecute(): boolean {
        return this.data.committedFile.status === Status.Modified;
    }
    public execute() {
        this.handler.compareFileWithPrevious(this.data);
    }
}
