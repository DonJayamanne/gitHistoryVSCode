import { IGitCommitViewDetailsCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class ViewDetailsCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCommitViewDetailsCommandHandler) {
        super(commit);
        this.setTitle('$(eye) View Change log');
    }
    public async preExecute(): Promise<boolean> {
        // Disable for now, useless command.
        return false;
    }
    public execute() {
        this.handler.viewDetails(this.data);
    }
}
