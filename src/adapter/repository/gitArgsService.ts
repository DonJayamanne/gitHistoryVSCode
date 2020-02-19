import { injectable } from 'inversify';
import { CommitInfo } from '../../types';
import { Helpers } from '../helpers';
import { LOG_ENTRY_SEPARATOR, LOG_FORMAT, newLineFormatCode } from './constants';
import { GitLogArgs, IGitArgsService } from './types';

@injectable()
export class GitArgsService implements IGitArgsService {
    constructor(private isWindows: boolean = /^win/.test(process.platform)) {}

    public getCommitArgs(hash: string): string[] {
        return ['show', LOG_FORMAT, '--decorate=full', '--numstat', hash];
    }
    public getCommitParentHashesArgs(hash: string): string[] {
        return ['log', '--format=%p', '-n1', hash];
    }
    public getCommitWithNumStatArgs(hash: string) {
        return ['show', '--numstat', '--format=', '-M', hash];
    }
    public getCommitNameStatusArgs(hash: string): string[] {
        return ['show', '--name-status', '--format=', '-M', hash];
    }
    public getCommitWithNumStatArgsForMerge(hash: string) {
        return ['show', '--numstat', '--format=', '-M', '--first-parent', hash];
    }
    public getCommitNameStatusArgsForMerge(hash: string): string[] {
        return ['show', '--name-status', '--format=', '-M', '--first-parent', hash];
    }
    public getObjectHashArgs(object: string): string[] {
        return ['show', `--format=${Helpers.GetCommitInfoFormatCode(CommitInfo.FullHash)}`, '--shortstat', object];
    }
    public getAuthorsArgs(): string[] {
        return ['shortlog', '-e', '-s', '-n', 'HEAD'];
    }
    public getDiffCommitWithNumStatArgs(hash1: string, hash2: string): string[] {
        return ['diff', '--numstat', hash1, hash2];
    }
    public getDiffCommitNameStatusArgs(hash1: string, hash2: string): string[] {
        return ['diff', '--name-status', hash1, hash2];
    }
    public getPreviousCommitHashForFileArgs(hash: string, file: string): string[] {
        return ['log', '--format=%H-%h', `${hash}^1`, '-n', '1', '--', file];
    }

    public getLogArgs(
        pageIndex: number = 0,
        pageSize: number = 100,
        branch: string = '',
        searchText: string = '',
        relativeFilePath?: string,
        lineNumber?: number,
        author?: string
    ): GitLogArgs {
        const allBranches = branch.trim().length === 0;
        const currentBranch = branch.trim() === '*';
        const specificBranch = !allBranches && !currentBranch;

        const authorArgs: string[] = [];
        if (author && author.length > 0) {
            authorArgs.push(`--author=${author} `);
        }

        const lineArgs =
            typeof lineNumber === 'number' && relativeFilePath
                ? [`-L${lineNumber},${lineNumber}:${relativeFilePath.replace(/\\/g, '/')}`]
                : [];
        const logArgs = ['log', ...authorArgs, ...lineArgs, '--full-history', LOG_FORMAT];
        const fileStatArgs = [
            'log',
            ...authorArgs,
            ...lineArgs,
            '--full-history',
            `--format=${LOG_ENTRY_SEPARATOR}${newLineFormatCode}`
        ];
        const counterArgs = ['log', ...authorArgs, ...lineArgs, '--full-history', `--format=${LOG_ENTRY_SEPARATOR}%h`];

        if (searchText && searchText.length > 0) {
            searchText
                .split(' ')
                .map(text => text.trim())
                .filter(text => text.length > 0)
                .forEach(text => {
                    logArgs.push(`--grep=${text}`, '-i');
                    fileStatArgs.push(`--grep=${text}`, '-i');
                    counterArgs.push(`--grep=${text}`, '-i');
                });
        }

        logArgs.push('--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`);
        fileStatArgs.push(
            '--date-order',
            '--decorate=full',
            `--skip=${pageIndex * pageSize}`,
            `--max-count=${pageSize}`
        );
        counterArgs.push('--date-order', '--decorate=full');

        // Don't use `--all`, cuz that will result in stashes `ref/stash` being included included in the logs.
        if (allBranches && lineArgs.length === 0) {
            logArgs.push('--branches', '--tags', '--remotes');
            fileStatArgs.push('--branches', '--tags', '--remotes');
            counterArgs.push('--branches', '--tags', '--remotes');
        }

        if (specificBranch && lineArgs.length === 0) {
            logArgs.push(branch);
            fileStatArgs.push(branch);
            counterArgs.push(branch);
        }

        // Check if we need a specific file
        if (relativeFilePath && lineArgs.length === 0) {
            const formattedPath = relativeFilePath.indexOf(' ') > 0 ? `"${relativeFilePath}"` : relativeFilePath;
            logArgs.push('--follow', '--', formattedPath);
            fileStatArgs.push('--follow', '--', formattedPath);
            counterArgs.push('--follow', '--', formattedPath);
        } else {
            if (specificBranch && lineArgs.length === 0) {
                logArgs.push('--');
                fileStatArgs.push('--');
                counterArgs.push('--');
            }
        }

        // Count only the number of lines in the log
        if (this.isWindows) {
            counterArgs.push('|', 'find', '/c', '/v', '""');
        } else {
            counterArgs.push('|', 'wc', '-l');
        }

        return { logArgs, fileStatArgs, counterArgs };
    }
}
