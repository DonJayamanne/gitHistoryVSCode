import { IGitCherryPickCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CherryPickCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCherryPickCommandHandler) {
        super(commit);
        // const committer = `${commit.logEntry.author!.name} <${commit.logEntry.author!.email}> on ${commit.logEntry.author!.date!.toLocaleString()}`;
        this.setTitle(`$(git-pull-request) Cherry pick this (${commit.logEntry.hash.short}) commit into current branch`);
        // this.setDescription(committer);
        // this.setDetail(commit.logEntry.subject);
        this.setCommand('git.commit.cherryPick');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.cherryPickCommit(this.data);
    }
}
