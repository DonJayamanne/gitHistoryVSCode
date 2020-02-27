import { injectable } from 'inversify';
import { CommitDetails, CompareCommitDetails, CompareFileCommitDetails, FileCommitDetails } from '../common/types';
import { CommittedFile } from '../types';
import { DirectoryNode, FileNode, INodeFactory } from './types';

@injectable()
export class StandardNodeFactory implements INodeFactory {
    public createDirectoryNode(commit: CommitDetails, relativePath: string) {
        return new DirectoryNode(commit, relativePath);
    }
    public createFileNode(commit: CommitDetails, committedFile: CommittedFile) {
        return new FileNode(
            new FileCommitDetails(commit.workspaceFolder, commit.branch, commit.logEntry, committedFile),
        );
    }
}

@injectable()
export class ComparisonNodeFactory implements INodeFactory {
    public createDirectoryNode(commit: CommitDetails, relativePath: string) {
        return new DirectoryNode(commit, relativePath);
    }
    public createFileNode(commit: CommitDetails, committedFile: CommittedFile) {
        const compareCommit = commit as CompareCommitDetails;

        return new FileNode(new CompareFileCommitDetails(compareCommit, compareCommit.rightCommit, committedFile));
    }
}
