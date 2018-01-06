import { inject, injectable } from 'inversify';
import { IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitCommandHandler } from '../commandHandlers/types';
import { CherryPickCommand } from '../commands/commit/cherryPick';
import { CreateBranchCommand } from '../commands/commit/createBranch';
import { ViewDetailsCommand } from '../commands/commit/viewDetails';
import { CommitData, ICommand } from '../common/types';
import { ICommitCommandFactory } from './types';

@injectable()
export class CommitCommandFactory implements ICommitCommandFactory {
    constructor( @inject(IGitBranchFromCommitCommandHandler) private branchCreationCommandHandler: IGitBranchFromCommitCommandHandler,
        @inject(IGitCherryPickCommandHandler) private cherryPickHandler: IGitCherryPickCommandHandler,
        @inject(IGitCommitCommandHandler) private viewChangeLogHandler: IGitCommitCommandHandler) { }
    public createCommands(commit: CommitData): ICommand<CommitData>[] {
        // tslint:disable-next-line:no-unnecessary-local-variable
        const commands: ICommand<CommitData>[] = [
            new CreateBranchCommand(commit, this.branchCreationCommandHandler),
            new CherryPickCommand(commit, this.cherryPickHandler),
            new ViewDetailsCommand(commit, this.viewChangeLogHandler)
        ];

        return commands;
    }
}
