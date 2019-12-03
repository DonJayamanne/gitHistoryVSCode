import { IGitCompareFileCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileCommand extends BaseFileCommitCommand {
    constructor(fileCommit: FileCommitDetails, private handler: IGitCompareFileCommandHandler) {
        super(fileCommit);
        if (handler.selectedCommit) {
            this.setTitle(`$(git-compare) Compare with ${handler.selectedCommit.logEntry.hash.short}`);
        }
        this.setCommand('git.commit.FileEntry.compare');
        this.setCommandArguments([fileCommit]);
    }
    public async preExecute(): Promise<boolean> {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO: Not completed
        return false;
        // return !!this.handler.selectedCommit;
    }
    public execute() {
        this.handler.compare(this.data);
    }
}
