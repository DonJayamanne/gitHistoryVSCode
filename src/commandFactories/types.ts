import { BranchDetails, CommitDetails, FileCommitDetails, ICommand } from '../common/types';

export const IFileCommitCommandFactory = Symbol('IFileCommitCommandFactory');

export interface IFileCommitCommandFactory {
    createCommands(data: FileCommitDetails): ICommand<FileCommitDetails>[];
}

export const ICommitCommandFactory = Symbol('ICommitCommandFactory');

export interface ICommitCommandFactory {
    createCommands(data: CommitDetails): ICommand<CommitDetails>[];
}

export const IBranchCommandFactory = Symbol('IBranchCommandFactory');

export interface IBranchCommandFactory {
    createCommands(data: BranchDetails): ICommand<BranchDetails>[];
}
