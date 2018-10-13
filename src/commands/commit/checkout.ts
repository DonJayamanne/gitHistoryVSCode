import { IGitCheckoutCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class CheckoutCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCheckoutCommandHandler) {
        super(commit);
        // const committer = `${commit.logEntry.author!.name} <${commit.logEntry.author!.email}> on ${commit.logEntry.author!.date!.toLocaleString()}`;
        this.setTitle(`$(git-pull-request) Checkout (${commit.logEntry.hash.short}) commit`);
        // this.setDescription(committer);
        // this.setDetail(commit.logEntry.subject);
        this.setCommand('git.commit.checkout');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.checkoutCommit(this.data);
    }
}
