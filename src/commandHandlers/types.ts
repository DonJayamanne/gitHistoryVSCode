import { FileCommitData, CommitData } from '../common/types';

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
    viewFile(fileCommit: FileCommitData): Promise<void>;
    compareFileWithWorkspace(fileCommit: FileCommitData): Promise<void>;
    compareFileWithPrevious(fileCommit: FileCommitData): Promise<void>;
}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends ICommandHandler {
    viewDetails(commit: CommitData): Promise<void>;
}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {
    cherryPickCommit(commit: CommitData): Promise<void>;
}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {
    createBranchFromCommit(commit: CommitData): void;
}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {
    readonly selectedCommit?: FileCommitData;
    selectCommit(fileCommit: FileCommitData): void;
    compare(fileCommit: FileCommitData): void;
}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
