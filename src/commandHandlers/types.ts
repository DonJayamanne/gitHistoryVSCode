import { CommitDetails, CompareFileCommitDetails, FileCommitDetails } from '../common/types';

export const ICommandHandler = Symbol.for('ICommandHandler');

export interface ICommandHandler {}

export const IGitHistoryCommandHandler = Symbol.for('IGitHistoryCommandHandler');
export interface IGitHistoryCommandHandler extends ICommandHandler {
    viewHistory(x: any): Promise<void>;
}

export const IGitFileHistoryCommandHandler = Symbol.for('IGitFileHistoryCommandHandler');
export interface IGitFileHistoryCommandHandler extends ICommandHandler {
    viewFile(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithWorkspace(fileCommit: FileCommitDetails): Promise<void>;
    compareFileWithPrevious(fileCommit: FileCommitDetails): Promise<void>;
    compareFileAcrossCommits(fileCommit: CompareFileCommitDetails): Promise<void>;
}

export const IGitCommitViewExplorerCommandHandler = Symbol.for('IGitCommitViewExplorerCommandHandler');
export interface IGitCommitViewExplorerCommandHandler extends ICommandHandler {
    hideCommitView(commit: CommitDetails | undefined): Promise<void>;
    showCommitView(commit: CommitDetails | undefined): Promise<void>;
}

export const IFileCommandHandler = Symbol.for('IFileCommandHandler');
export type IFileCommandHandler = ICommandHandler;

export const IGitCompareCommitViewExplorerCommandHandler = Symbol.for('IGitCompareCommitViewExplorerCommandHandler');
export interface IGitCompareCommitViewExplorerCommandHandler extends ICommandHandler {
    hide(): Promise<void>;
    show(): Promise<void>;
}

export const IGitCommitCommandHandler = Symbol.for('IGitCommitCommandHandler');
export interface IGitCommitCommandHandler extends ICommandHandler {
    doSomethingWithCommit(commit: CommitDetails): Promise<void>;
    createTagFromCommit(commit: CommitDetails, newTagName?: string): Promise<void>;
    createBranchFromCommit(commit: CommitDetails, newBranchName?: string): Promise<void>;
    onCommitSelected(commit: CommitDetails): Promise<void>;
}

export const IGitRefCommandHandler = Symbol.for('IGitRefCommandHandler');
export type IGitRefCommandHandler = ICommandHandler;

export const IGitCommitViewDetailsCommandHandler = Symbol.for('IGitCommitViewDetailsCommandHandler');
export interface IGitCommitViewDetailsCommandHandler extends ICommandHandler {
    viewDetails(commit: CommitDetails): Promise<void>;
    viewCommitTree(commit: CommitDetails): Promise<void>;
}

export const IGitCherryPickCommandHandler = Symbol.for('IGitCherryPickCommandHandler');
export interface IGitCherryPickCommandHandler extends ICommandHandler {
    cherryPickCommit(commit: CommitDetails): Promise<void>;
}

export const IGitCheckoutCommandHandler = Symbol.for('IGitCheckoutCommandHandler');
export interface IGitCheckoutCommandHandler extends ICommandHandler {
    checkoutCommit(commit: CommitDetails): Promise<void>;
}

export const IGitMergeCommandHandler = Symbol.for('IGitMergeCommandHandler');
export interface IGitMergeCommandHandler extends ICommandHandler {
    merge(commit: CommitDetails): Promise<void>;
}

export const IGitRebaseCommandHandler = Symbol.for('IGitRebaseCommandHandler');
export interface IGitRebaseCommandHandler extends ICommandHandler {
    rebase(commit: CommitDetails): Promise<void>;
}

export const IGitRevertCommandHandler = Symbol.for('IGitRevertCommandHandler');
export interface IGitRevertCommandHandler extends ICommandHandler {
    revertCommit(commit: CommitDetails, showPrompt?: boolean): Promise<void>;
}

export const IGitCompareCommandHandler = Symbol.for('IGitCompareCommandHandler');
export interface IGitCompareCommandHandler extends ICommandHandler {
    readonly selectedCommit?: CommitDetails;
    select(fileCommit: CommitDetails): Promise<void>;
    compare(fileCommit: CommitDetails): Promise<void>;
}

export const IGitCompareFileCommandHandler = Symbol.for('IGitCompareFileCommandHandler');
export interface IGitCompareFileCommandHandler extends ICommandHandler {
    readonly selectedCommit?: FileCommitDetails;
    select(fileCommit: FileCommitDetails): Promise<void>;
    compare(fileCommit: FileCommitDetails): Promise<void>;
}

export const ICommandHandlerManager = Symbol.for('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
