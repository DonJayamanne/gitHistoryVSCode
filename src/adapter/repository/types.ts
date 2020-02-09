// import { FsUri } from '../../types';

export type GitLogArgs = {
    logArgs: string[];
    fileStatArgs: string[];
    counterArgs: string[];
};
export const IGitArgsService = Symbol('IGitArgsService');

export interface IGitArgsService {
    getAuthorsArgs(): string[];
    getCommitArgs(hash: string): string[];
    getCommitParentHashesArgs(hash: string): string[];
    getCommitWithNumStatArgs(hash: string): string[];
    getCommitNameStatusArgs(hash: string): string[];
    getCommitWithNumStatArgsForMerge(hash: string): string[];
    getCommitNameStatusArgsForMerge(hash: string): string[];
    getObjectHashArgs(object: string): string[];
    getRefsContainingCommitArgs(hash: string): string[];
    getLogArgs(pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, relativeFilePath?: string, lineNumber?: number, author?: string): GitLogArgs;
    getDiffCommitWithNumStatArgs(hash1: string, hash2: string): string[];
    getDiffCommitNameStatusArgs(hash1: string, hash2: string): string[];
    getPreviousCommitHashForFileArgs(hash: string, file: string): string[];
}

export enum GitOriginType {
    any = 1,
    github = 2,
    bitbucket = 3,
    tfs = 4,
    vsts = 5
}
