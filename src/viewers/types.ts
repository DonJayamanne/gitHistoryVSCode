import { CommitDetails } from '../common/types';
import { DirectoryNode, FileNode } from '../nodes/types';

export const ICommitViewer = Symbol('ICommitViewer');

export interface ICommitViewer {
    showCommit(commit: CommitDetails): void;
    showCommitTree(commit: CommitDetails): void;
    getList(): (DirectoryNode | FileNode)[];
    getTreeNodes(): (DirectoryNode | FileNode)[];
}
