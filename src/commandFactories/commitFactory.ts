import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler } from '../commandHandlers/types';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CreateBranchCommand } from '../commands/commit/createBranch';
import { CommitContext, ICommand } from '../common/types';
import { ICommitCommandFactory } from './types';

@injectable()
export class CommitCommandFactory implements ICommitCommandFactory {
    constructor( @inject(IGitBranchFromCommitCommandHandler) private branchCreationCommandHandler: IGitBranchFromCommitCommandHandler,
        @inject(IGitCherryPickCommandHandler) private cherryPickHandler: IGitCherryPickCommandHandler) { }
    public createCommands(context: CommitContext): ICommand<CommitContext>[] {
        // tslint:disable-next-line:no-unnecessary-local-variable
        const commands: ICommand<CommitContext>[] = [
            new CreateBranchCommand(context, this.branchCreationCommandHandler),
            new CherryPickCommand(context, this.cherryPickHandler)
        ];

        return commands;
    }
}
