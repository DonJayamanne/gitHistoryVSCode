import { inject, injectable } from 'inversify';
import { IGitCompareCommandHandler, IGitFileHistoryCommandHandler } from '../commandHandlers/types';
import { CompareFileCommand } from '../commands/fileCommit/compareFile';
import { CompareFileWithPreviousCommand } from '../commands/fileCommit/compareFileWithPrevious';
import { CompareFileWithWorkspaceCommand } from '../commands/fileCommit/compareFileWithWorkspace';
import { SelectFileForComparison } from '../commands/fileCommit/selectFileForComparison';
import { ViewFileCommand } from '../commands/fileCommit/viewFile';
import { FileCommitDetails, ICommand } from '../common/types';
import { IFileCommitCommandFactory } from './types';

@injectable()
export class FileCommitCommandFactory implements IFileCommitCommandFactory {
    constructor( @inject(IGitFileHistoryCommandHandler) private fileHistoryCommandHandler: IGitFileHistoryCommandHandler,
        @inject(IGitCompareCommandHandler) private fileCompareHandler: IGitCompareCommandHandler) { }
    public createCommands(fileCommit: FileCommitDetails): ICommand<FileCommitDetails>[] {
        const commands: ICommand<FileCommitDetails>[] = [
            new ViewFileCommand(fileCommit, this.fileHistoryCommandHandler),
            new CompareFileWithWorkspaceCommand(fileCommit, this.fileHistoryCommandHandler),
            new CompareFileWithPreviousCommand(fileCommit, this.fileHistoryCommandHandler),
            new SelectFileForComparison(fileCommit, this.fileCompareHandler)
        ];

        if (this.fileCompareHandler.selectedCommit) {
            commands.push(new CompareFileCommand(fileCommit, this.fileCompareHandler, this.fileCompareHandler.selectedCommit!));
        }

        return commands;
    }
}
