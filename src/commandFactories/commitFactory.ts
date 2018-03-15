import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitViewDetailsCommandHandler, IGitCompareCommandHandler, IGitMergeCommandHandler, IGitRebaseCommandHandler, IGitRevertCommandHandler } from '../commandHandlers/types';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CompareCommand } from '../commands/commit/compare';
import { CreateBranchCommand } from '../commands/commit/createBranch';
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
        @inject(IGitCherryPickCommandHandler) private cherryPickHandler: IGitCherryPickCommandHandler,
        @inject(IGitCompareCommandHandler) private compareHandler: IGitCompareCommandHandler,
        @inject(IGitMergeCommandHandler) private mergeHandler: IGitMergeCommandHandler,
        @inject(IGitRebaseCommandHandler) private rebaseHandler: IGitRebaseCommandHandler,
        @inject(IGitRevertCommandHandler) private revertHandler: IGitRevertCommandHandler,
        @inject(IGitCommitViewDetailsCommandHandler) private viewChangeLogHandler: IGitCommitViewDetailsCommandHandler) { }
    public async createCommands(commit: CommitDetails): Promise<ICommand<CommitDetails>[]> {
        const commands: ICommand<CommitDetails>[] = [
            new CreateBranchCommand(commit, this.branchCreationCommandHandler),
            new CherryPickCommand(commit, this.cherryPickHandler),
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
}
