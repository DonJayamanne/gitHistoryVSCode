import { inject, injectable } from 'inversify';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCompareFileCommandHandler, IGitFileHistoryCommandHandler } from '../commandHandlers/types';
import { CompareFileCommand } from '../commands/fileCommit/compareFile';
import { CompareFileWithAcrossCommitCommand } from '../commands/fileCommit/compareFileAcrossCommits';
import { CompareFileWithPreviousCommand } from '../commands/fileCommit/compareFileWithPrevious';
import { CompareFileWithWorkspaceCommand } from '../commands/fileCommit/compareFileWithWorkspace';
import { ViewFileHistoryCommand } from '../commands/fileCommit/fileHistory';
import { SelectFileForComparison } from '../commands/fileCommit/selectFileForComparison';
import { ViewFileCommand } from '../commands/fileCommit/viewFile';
import { CompareFileCommitDetails, FileCommitDetails, ICommand } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IFileCommitCommandFactory } from './types';

@injectable()
export class FileCommitCommandFactory implements IFileCommitCommandFactory {
    constructor( @inject(IGitFileHistoryCommandHandler) private fileHistoryCommandHandler: IGitFileHistoryCommandHandler,
        @inject(IGitCompareFileCommandHandler) private fileCompareHandler: IGitCompareFileCommandHandler,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public async createCommands(fileCommit: FileCommitDetails): Promise<ICommand<FileCommitDetails>[]> {
        const commands = [
            new ViewFileCommand(fileCommit, this.fileHistoryCommandHandler),
            new CompareFileWithWorkspaceCommand(fileCommit, this.fileHistoryCommandHandler, this.serviceContainer),
            new CompareFileWithPreviousCommand(fileCommit, this.fileHistoryCommandHandler),
            new SelectFileForComparison(fileCommit, this.fileCompareHandler),
            new CompareFileCommand(fileCommit, this.fileCompareHandler),
            new ViewFileHistoryCommand(fileCommit, this.commandManager)
        ];

        return (await Promise.all(commands.map(async cmd => {
            return await cmd.preExecute() ? cmd : undefined;
        })))
            .filter(cmd => !!cmd)
            .map(cmd => cmd!);
    }
    public async getDefaultFileCommand(fileCommit: FileCommitDetails | CompareFileCommitDetails): Promise<ICommand<FileCommitDetails> | undefined> {
        if (fileCommit instanceof CompareFileCommitDetails) {
            return new CompareFileWithAcrossCommitCommand(fileCommit, this.fileHistoryCommandHandler);
        }
        const commands = [
            new CompareFileWithPreviousCommand(fileCommit, this.fileHistoryCommandHandler),
            new ViewFileCommand(fileCommit, this.fileHistoryCommandHandler)
        ];
        const availableCommands = (await Promise.all(commands.map(async cmd => {
            return await cmd.preExecute() ? cmd : undefined;
        })))
            .filter(cmd => !!cmd)
            .map(cmd => cmd!);
        return availableCommands.length === 0 ? undefined : availableCommands[0];
    }
}
