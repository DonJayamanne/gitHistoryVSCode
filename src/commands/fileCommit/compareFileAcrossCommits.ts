import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { CompareFileCommitDetails } from '../../common/types';
import { Status } from '../../types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithAcrossCommitCommand extends BaseFileCommitCommand {
    constructor(fileCommit: CompareFileCommitDetails, private handler: IGitFileHistoryCommandHandler) {
        super(fileCommit);
        this.setTitle('$(git-compare) Compare');
        this.setCommand('git.commit.compare.file.compare');
        this.setCommandArguments([fileCommit]);
    }
    public async preExecute(): Promise<boolean> {
        return this.data.committedFile.status === Status.Modified;
    }
    public execute() {
        this.handler.compareFileAcrossCommits(this.data as CompareFileCommitDetails);
    }
}
