import { CommitDetails, CompareFileCommitDetails, FileCommitDetails } from '../common/types';

export const ICommandHandler = Symbol('ICommandHandler');

export interface ICommandHandler {
}

export const IGitHistoryCommandHandler = Symbol('IGitHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryCommandHandler extends ICommandHandler {
    // tslint:disable-next-line:no-any
    viewHistory(x: any): Promise<void>;
}

export const IGitFileHistoryCommandHandler = Symbol('IGitFileHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitFileHistoryCommandHandler extends ICommandHandler {
    doSomethingWithFile(fileCommit: FileCommitDetails): Promise<void>;
    viewFile(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithWorkspace(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithPrevious(fileCommit: FileCommitDetails): Promise<void>;
    compareFileAcrossCommits(fileCommit: CompareFileCommitDetails): Promise<void>;
}

export const IGitCommitViewExplorerCommandHandler = Symbol('IGitCommitViewExplorerCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitViewExplorerCommandHandler extends ICommandHandler {
    hideCommitView(commit: CommitDetails | undefined): Promise<void>;
    showCommitView(commit: CommitDetails | undefined): Promise<void>;
}

export const IFileCommandHandler = Symbol('IFileCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IFileCommandHandler extends ICommandHandler {
}

export const IGitCompareCommitViewExplorerCommandHandler = Symbol('IGitCompareCommitViewExplorerCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommitViewExplorerCommandHandler extends ICommandHandler {
    hide(): Promise<void>;
    show(): Promise<void>;
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
    viewCommitTree(commit: CommitDetails): Promise<void>;
}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {
    cherryPickCommit(commit: CommitDetails): Promise<void>;
}

export const IGitRevertCommandHandler = Symbol('IGitRevertCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitRevertCommandHandler extends ICommandHandler {
    revertCommit(commit: CommitDetails, showPrompt?: boolean): Promise<void>;
}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {
    createBranchFromCommit(commit: CommitDetails): void;
}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {
    readonly selectedCommit?: CommitDetails;
    select(fileCommit: CommitDetails): Promise<void>;
    compare(fileCommit: CommitDetails): Promise<void>;
}

export const IGitCompareFileCommandHandler = Symbol('IGitCompareFileCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareFileCommandHandler extends ICommandHandler {
    readonly selectedCommit?: FileCommitDetails;
    select(fileCommit: FileCommitDetails): Promise<void>;
    compare(fileCommit: FileCommitDetails): Promise<void>;
}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
