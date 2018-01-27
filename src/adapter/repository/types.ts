// import { FsUri } from '../../types';

export type GitLogArgs = {
    logArgs: string[];
    fileStatArgs: string[];
    counterArgs: string[];
};
export const IGitArgsService = Symbol('IGitArgsService');

export interface IGitArgsService {
    getGitRootArgs(): string[];
    getCurrentBranchArgs(): string[];
    getCommitDateArgs(hash: string): string[];
    getCommitArgs(hash: string): string[];
    getCommitParentHashesArgs(hash: string): string[];
    getCommitWithNumStatArgs(hash: string): string[];
    getCommitNameStatusArgs(hash: string): string[];
    getCommitWithNumStatArgsForMerge(hash: string): string[];
    getCommitNameStatusArgsForMerge(hash: string): string[];
    getObjectHashArgs(object: string): string[];
    getRefsContainingCommitArgs(hash: string): string[];
    getLogArgs(pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, relativeFilePath?: string): GitLogArgs;
    getDiffCommitWithNumStatArgs(hash1: string, hash2: string): string[];
    getDiffCommitNameStatusArgs(hash1: string, hash2: string): string[];
    getPreviousCommitHashForFileArgs(hash: string, file: string): string[];
    // getCommittedFileArgs(hash1: string, file: FsUri | string): string[];
    // getCommittedFileContentArgs(hash1: string, file: FsUri | string): string[];
}

export enum GitOriginType {
    github = 1,
    bitbucket = 2,
    tfs = 3
}
