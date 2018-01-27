import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitViewDetailsCommandHandler, IGitCompareCommandHandler, IGitRevertCommandHandler } from '../commandHandlers/types';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CompareCommand } from '../commands/commit/compare';
import { CreateBranchCommand } from '../commands/commit/createBranch';
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
        @inject(IGitRevertCommandHandler) private revertHandler: IGitRevertCommandHandler,
        @inject(IGitCommitViewDetailsCommandHandler) private viewChangeLogHandler: IGitCommitViewDetailsCommandHandler) { }
    public async createCommands(commit: CommitDetails): Promise<ICommand<CommitDetails>[]> {
        const commands: ICommand<CommitDetails>[] = [
            new CreateBranchCommand(commit, this.branchCreationCommandHandler),
            new CherryPickCommand(commit, this.cherryPickHandler),
            new ViewDetailsCommand(commit, this.viewChangeLogHandler),
            new SelectForComparison(commit, this.compareHandler),
            new RevertCommand(commit, this.revertHandler),
            new CompareCommand(commit, this.compareHandler)
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
