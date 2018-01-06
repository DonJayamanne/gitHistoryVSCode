import { CommitDetails, FileCommitDetails } from '../common/types';

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
    viewFile(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithWorkspace(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithPrevious(fileCommit: FileCommitDetails): Promise<void>;
}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends ICommandHandler {
    doSomethingWithCommit(commit: CommitDetails): Promise<void>;
}

export const IGitCommitViewDetailsCommandHandler = Symbol('IGitCommitViewDetailsCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitViewDetailsCommandHandler extends ICommandHandler {
    viewDetails(commit: CommitDetails): Promise<void>;
}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {
    cherryPickCommit(commit: CommitDetails): Promise<void>;
}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {
    createBranchFromCommit(commit: CommitDetails): void;
}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {
    readonly selectedCommit?: FileCommitDetails;
    selectCommit(fileCommit: FileCommitDetails): void;
    compare(fileCommit: FileCommitDetails): void;
}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
