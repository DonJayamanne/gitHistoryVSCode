import { inject, injectable } from 'inversify';
import { IGitCompareCommandHandler, IGitFileHistoryCommandHandler } from '../commandHandlers/types';
import { CompareFileCommand } from '../commands/fileCommit/compareFile';
import { CompareFileWithPreviousCommand } from '../commands/fileCommit/compareFileWithPrevious';
import { CompareFileWithWorkspaceCommand } from '../commands/fileCommit/compareFileWithWorkspace';
import { SelectFileForComparison } from '../commands/fileCommit/selectFileForComparison';
import { ViewFileCommand } from '../commands/fileCommit/viewFile';
import { FileCommitContext, ICommand } from '../common/types';
import { IFileCommitCommandFactory } from './types';

@injectable()
export class FileCommitCommandFactory implements IFileCommitCommandFactory {
    constructor( @inject(IGitFileHistoryCommandHandler) private fileHistoryCommandHandler: IGitFileHistoryCommandHandler,
        @inject(IGitCompareCommandHandler) private fileCompareHandler: IGitCompareCommandHandler) { }
    public createCommands(context: FileCommitContext): ICommand<FileCommitContext>[] {
        const commands: ICommand<FileCommitContext>[] = [
            new ViewFileCommand(context, this.fileHistoryCommandHandler),
            new CompareFileWithWorkspaceCommand(context, this.fileHistoryCommandHandler),
            new CompareFileWithPreviousCommand(context, this.fileHistoryCommandHandler),
            new SelectFileForComparison(context, this.fileCompareHandler)
        ];

        if (!this.fileCompareHandler.selectedCommit) {
            commands.push(new CompareFileCommand(context, this.fileCompareHandler, this.fileCompareHandler.selectedCommit!));
        }

        return commands;
    }
}
