import { IGitCommitCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CreateBranchCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCommitCommandHandler) {
        super(commit);
        // const committer = `${commit.logEntry.author!.name} <${commit.logEntry.author!.email}> on ${commit.logEntry.author!.date!.toLocaleString()}`;
        // this.setTitle(`$(git-branch) Branch from here ${commit.logEntry.hash.short} (${committer})`);
        this.setTitle('$(git-branch) Branch from here');
        // this.setDetail(commit.logEntry.subject);
        this.setCommand('git.commit.createBranch');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.createBranchFromCommit(this.data);
    }
}
