import * as path from 'path';
import { IGitFileHistoryCommandHandler } from '../../commandHandlers/types';
import { FileCommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IFileSystem } from '../../platform/types';
import { BaseFileCommitCommand } from '../baseFileCommitCommand';

export class CompareFileWithWorkspaceCommand extends BaseFileCommitCommand {
    constructor(
        fileCommit: FileCommitDetails,
        private handler: IGitFileHistoryCommandHandler,
        private serviceContainer: IServiceContainer,
    ) {
        super(fileCommit);
        this.setTitle('$(git-compare) Compare against workspace file');
        this.setCommand('git.commit.FileEntry.CompareAgainstWorkspace');
        this.setCommandArguments([fileCommit]);
    }
    public async preExecute(): Promise<boolean> {
        const localFile = path.join(this.data.workspaceFolder, this.data.committedFile.relativePath);
        const fileSystem = this.serviceContainer.get<IFileSystem>(IFileSystem);
        return fileSystem.fileExistsAsync(localFile);
    }
    public execute() {
        this.handler.compareFileWithWorkspace(this.data);
    }
}
