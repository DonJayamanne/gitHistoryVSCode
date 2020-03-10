import { CommitDetails } from '../common/types';
import { CommitComparison } from '../types';

export const ICommitViewer = Symbol.for('ICommitViewer');

export interface ICommitViewer {
    readonly selectedCommit: Readonly<CommitDetails>;
    showCommit(commit: CommitDetails): void;
    showCommitTree(commit: CommitDetails): void;
    showFilesView(): void;
    showFolderView(): void;
}

export const ICompareCommitViewer = Symbol.for('ICompareCommitViewer');

export interface ICompareCommitViewer {
    readonly comparison: Readonly<CommitComparison>;
    showComparisonTree(comparison: CommitComparison): void;
    showFilesView(): void;
    showFolderView(): void;
}

export const ICommitViewerFactory = Symbol.for('ICommitViewerFactory');

export interface ICommitViewerFactory {
    getCommitViewer(): ICommitViewer;
    getCompareCommitViewer(): ICommitViewer;
}
