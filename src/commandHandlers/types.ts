import { FileCommitContext, CommitContext } from '../common/types';

export const ICommandHandler = Symbol('ICommandHandler');

export interface ICommandHandler {
}

export const IGitHistoryCommandHandler = Symbol('IGitHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryCommandHandler extends ICommandHandler {

}

export const IGitFileHistoryCommandHandler = Symbol('IGitFileHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitFileHistoryCommandHandler extends ICommandHandler {
    viewFile(context: FileCommitContext): Promise<void>;
    compareFileWithWorkspace(context: FileCommitContext): Promise<void>;
    compareFileWithPrevious(context: FileCommitContext): Promise<void>;
}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends ICommandHandler {

}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {
    cherryPickCommit(context: CommitContext): Promise<void>;
}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {
    createBranchFromCommit(context: CommitContext): void;
}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {
    readonly selectedCommit?: FileCommitContext;
    selectCommit(context: FileCommitContext): void;
    compare(context: FileCommitContext): void;
}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
