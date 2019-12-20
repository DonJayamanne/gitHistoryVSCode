import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCheckoutCommandHandler, IGitCherryPickCommandHandler, IGitCommitViewDetailsCommandHandler, IGitCompareCommandHandler, IGitMergeCommandHandler, IGitRebaseCommandHandler, IGitRevertCommandHandler, IGitTagFromCommitCommandHandler } from '../commandHandlers/types';
import { CheckoutCommand } from '../commands/commit/checkout';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CompareCommand } from '../commands/commit/compare';
import { CreateBranchCommand } from '../commands/commit/createBranch';
import { CreateTagCommand } from '../commands/commit/createTag';
import { MergeCommand } from '../commands/commit/merge';
import { RebaseCommand } from '../commands/commit/rebase';
import { RevertCommand } from '../commands/commit/revert';
import { SelectForComparison } from '../commands/commit/selectForComparion';
import { ViewDetailsCommand } from '../commands/commit/viewDetails';
import { CommitDetails, ICommand } from '../common/types';
import { ICommitCommandFactory } from './types';

@injectable()
export class CommitCommandFactory implements ICommitCommandFactory {
    constructor( @inject(IGitBranchFromCommitCommandHandler) private branchCreationCommandHandler: IGitBranchFromCommitCommandHandler,
        @inject(IGitTagFromCommitCommandHandler) private tagCreationCommandHandler: IGitTagFromCommitCommandHandler,
        @inject(IGitCherryPickCommandHandler) private cherryPickHandler: IGitCherryPickCommandHandler,
        @inject(IGitCheckoutCommandHandler) private checkoutHandler: IGitCheckoutCommandHandler,
        @inject(IGitCompareCommandHandler) private compareHandler: IGitCompareCommandHandler,
        @inject(IGitMergeCommandHandler) private mergeHandler: IGitMergeCommandHandler,
        @inject(IGitRebaseCommandHandler) private rebaseHandler: IGitRebaseCommandHandler,
        @inject(IGitRevertCommandHandler) private revertHandler: IGitRevertCommandHandler,
        @inject(IGitCommitViewDetailsCommandHandler) private viewChangeLogHandler: IGitCommitViewDetailsCommandHandler) { }
    public async createCommands(commit: CommitDetails): Promise<ICommand<CommitDetails>[]> {
        const commands: ICommand<CommitDetails>[] = [
            new CherryPickCommand(commit, this.cherryPickHandler),
            new CheckoutCommand(commit, this.checkoutHandler),
            new ViewDetailsCommand(commit, this.viewChangeLogHandler),
            new SelectForComparison(commit, this.compareHandler),
            new RevertCommand(commit, this.revertHandler),
            new CompareCommand(commit, this.compareHandler),
            new MergeCommand(commit, this.mergeHandler),
            new RebaseCommand(commit, this.rebaseHandler)
        ];

        return (await Promise.all(commands.map(async cmd => {
            const result = cmd.preExecute();
            const available = typeof result === 'boolean' ? result : await result;
            return available ? cmd : undefined;
        })))
            .filter(cmd => !!cmd)
            .map(cmd => cmd!);
    }

    public async createNewCommands(commit: CommitDetails): Promise<ICommand<CommitDetails>[]> {
        const commands: ICommand<CommitDetails>[] = [
            new CreateBranchCommand(commit, this.branchCreationCommandHandler),
            new CreateTagCommand(commit, this.tagCreationCommandHandler)
        ];

        return (await Promise.all(commands.map(async cmd => {
            const result = cmd.preExecute();
            const available = typeof result === 'boolean' ? result : await result;
            return available ? cmd : undefined;
        })))
            .filter(cmd => !!cmd)
            .map(cmd => cmd!);
    }
}
