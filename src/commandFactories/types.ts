import { BranchContext, CommitContext, FileCommitContext, ICommand } from '../common/types';

export const IFileCommitCommandFactory = Symbol('IFileCommitCommandFactory');

export interface IFileCommitCommandFactory {
    createCommands(data: FileCommitContext): ICommand<FileCommitContext>[];
}

export const ICommitCommandFactory = Symbol('ICommitCommandFactory');

export interface ICommitCommandFactory {
    createCommands(data: CommitContext): ICommand<CommitContext>[];
}

export const IBranchCommandFactory = Symbol('IBranchCommandFactory');

export interface IBranchCommandFactory {
    createCommands(data: BranchContext): ICommand<BranchContext>[];
}
