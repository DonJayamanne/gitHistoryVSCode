import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CompareCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCompareCommandHandler) {
        super(commit);
        if (handler.selectedCommit) {
            const committer = `${commit.logEntry.author!.name} <${
                commit.logEntry.author!.email
            }> on ${commit.logEntry.author!.date!.toLocaleString()}`;
            this.setTitle(`$(git-compare) Compare with ${handler.selectedCommit!.logEntry.hash.short}, ${committer}`);
            this.setDetail(commit.logEntry.subject);
        }
        this.setCommand('git.commit.compare');
        this.setCommandArguments([commit]);
    }
    public async preExecute(): Promise<boolean> {
        return !!this.handler.selectedCommit;
    }
    public execute() {
        this.handler.compare(this.data);
    }
}
