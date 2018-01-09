import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CreateBranchCommand } from '../commands/commit/createBranch';
import { ViewDetailsCommand } from '../commands/commit/viewDetails';
import { CommitDetails, ICommand } from '../common/types';
import { ICommitCommandFactory } from './types';

@injectable()
export class CommitCommandFactory implements ICommitCommandFactory {
    constructor( @inject(IGitBranchFromCommitCommandHandler) private branchCreationCommandHandler: IGitBranchFromCommitCommandHandler,
        @inject(IGitCherryPickCommandHandler) private cherryPickHandler: IGitCherryPickCommandHandler,
        @inject(IGitCommitViewDetailsCommandHandler) private viewChangeLogHandler: IGitCommitViewDetailsCommandHandler) { }
    public async createCommands(commit: CommitDetails): Promise<ICommand<CommitDetails>[]> {
        const commands: ICommand<CommitDetails>[] = [
            new CreateBranchCommand(commit, this.branchCreationCommandHandler),
            new CherryPickCommand(commit, this.cherryPickHandler),
            new ViewDetailsCommand(commit, this.viewChangeLogHandler)
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
