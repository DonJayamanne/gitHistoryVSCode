import { IGitTagFromCommitCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CreateTagCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitTagFromCommitCommandHandler) {
        super(commit);
        this.setTitle(`$(tag) Tag commit ${commit.logEntry!.hash!.short}`);
        this.setCommand('git.commit.createTag');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.createTagFromCommit(this.data);
    }
}
