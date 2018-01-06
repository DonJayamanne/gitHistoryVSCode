import { IGitCommitCommandHandler } from '../../commandHandlers/types';
import { CommitData } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class ViewDetailsCommand extends BaseCommitCommand {
    constructor(commit: CommitData, private handler: IGitCommitCommandHandler) {
        super(commit);
        this.setLabel('View Change log');

    }
    public execute() {
        this.handler.viewDetails(this.data);
    }
}
