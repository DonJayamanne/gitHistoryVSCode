import { CommitDetails } from '../common/types';

export const ICommitViewer = Symbol('ICommitViewer');

export interface ICommitViewer {
    readonly selectedCommit: Readonly<CommitDetails>;
    showCommit(commit: CommitDetails): void;
    showCommitTree(commit: CommitDetails): void;
    showFilesView(): void;
    showFolderView(): void;
}
