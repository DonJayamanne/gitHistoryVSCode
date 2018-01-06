import { BranchData, CommitData, FileCommitData, ICommand } from '../common/types';

export const IFileCommitCommandFactory = Symbol('IFileCommitCommandFactory');

export interface IFileCommitCommandFactory {
    createCommands(data: FileCommitData): ICommand<FileCommitData>[];
}

export const ICommitCommandFactory = Symbol('ICommitCommandFactory');

export interface ICommitCommandFactory {
    createCommands(data: CommitData): ICommand<CommitData>[];
}

export const IBranchCommandFactory = Symbol('IBranchCommandFactory');

export interface IBranchCommandFactory {
    createCommands(data: BranchData): ICommand<BranchData>[];
}
