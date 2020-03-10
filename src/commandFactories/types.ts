import { BranchDetails, CommitDetails, FileCommitDetails, ICommand } from '../common/types';

export const IFileCommitCommandFactory = Symbol.for('IFileCommitCommandFactory');

export interface IFileCommitCommandFactory {
    createCommands(data: FileCommitDetails): Promise<ICommand<FileCommitDetails>[]>;
    getDefaultFileCommand(fileCommitDetails: FileCommitDetails): Promise<ICommand<FileCommitDetails> | undefined>;
}

export const ICommitCommandFactory = Symbol.for('ICommitCommandFactory');

export interface ICommitCommandFactory {
    createCommands(data: CommitDetails): Promise<ICommand<CommitDetails>[]>;
}

export const IBranchCommandFactory = Symbol.for('IBranchCommandFactory');

export interface IBranchCommandFactory {
    createCommands(data: BranchDetails): Promise<ICommand<BranchDetails>[]>;
}
