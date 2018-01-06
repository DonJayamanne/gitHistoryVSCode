import { IGitCommitCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class ViewDetailsCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCommitCommandHandler) {
        super(commit);
        this.setLabel('View Change log');

    }
    public execute() {
        this.handler.viewDetails(this.data);
    }
}
