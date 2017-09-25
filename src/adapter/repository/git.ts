// import { FileStat } from '../contracts';
import { injectable } from 'inversify';
import * as path from 'path';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Uri } from 'vscode';
import { Branch, IGit, LogEntries, LogEntry } from '../contracts';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers';

const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const ITEM_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA6';
const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA7';
const LOG_FORMAT_ARGS = ['%D', '%H', '%h', '%T', '%t', '%P', '%p', '%an', '%ae', '%at', '%c', '%ce', '%ct', '%s', '%b', '%N'];
const LOG_FORMAT = `--format=${LOG_ENTRY_SEPARATOR}${[...LOG_FORMAT_ARGS, STATS_SEPARATOR, ITEM_ENTRY_SEPARATOR].join(ITEM_ENTRY_SEPARATOR)}`;

@injectable()
export class Git implements IGit {
    private gitRootPath: string;
    private async exec(args: string[]): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        return await this.gitCmdExecutor.exec(args, gitRootPath);
    }
    private async execInShell(args: string[]): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        return await this.gitCmdExecutor.exec(args, { cwd: gitRootPath, shell: true });
    }
    // how to check if a commit has been merged into any other branch
    //  $ git branch --all --contains 019daf673583208aaaf8c3f18f8e12696033e3fc
    //  remotes/origin/chrmarti/azure-account
    //  If the output contains just one branch, then this means NO, its in the same source branch
    // NOTE:
    // When returning logEntry,
    //  Check if anything has a ref of type HEAD,
    //  If it does, this means that's the head of a particular branch
    //  This means we don't need to draw the graph line all the way up into no where...
    // However, if this branch has been merged, then we need to draw it all the way up (or till its merge has been found)
    //  To do this we need to perform the step of determining if it has been merged
    // Note: Even if we did find a merged location, this doesn't mean we shouldn't stop drawing the line
    //  Its possible the other branch that it has been merged into is out of the current page
    //  In this instance the grap line will have to go up (to no where)...

    private async getGitRelativePath(file: Uri) {
        const gitRoot: string = await this.getGitRoot();
        return path.relative(gitRoot, file.fsPath).replace(/\\/g, '/');
    }

    private async getLogArgs(pageIndex: number = 0, pageSize: number = 100, branch: string = '', searchText: string = '', file?: Uri) {
        const allBranches = branch.trim().length === 0;
        const currentBranch = branch.trim() === '*';
        const specificBranch = !allBranches && !currentBranch;

        const logArgs = ['log', LOG_FORMAT];
        const fileStatArgs = ['log', `--format=${LOG_ENTRY_SEPARATOR}%n`];
        const counterArgs = ['log', `--format=${LOG_ENTRY_SEPARATOR}%h`];

        if (searchText && searchText.length > 0) {
            searchText.split(' ')
                .map(text => text.trim())
                .filter(text => text.length > 0)
                .forEach(text => {
                    logArgs.push(`--grep=${text}`);
                    fileStatArgs.push(`--grep=${text}`);
                    counterArgs.push(`--grep=${text}`);
                });
        }

        logArgs.push('--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`);
        fileStatArgs.push('--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`);
        counterArgs.push('--date-order', '--decorate=full');

        if (allBranches) {
            logArgs.push('--all');
            fileStatArgs.push('--all');
            counterArgs.push('--all');
        }

        // Check if we need a specific file
        if (file) {
            const relativePath = await this.getGitRelativePath(file);
            logArgs.push(relativePath);
            fileStatArgs.push(relativePath);
            counterArgs.push(relativePath);
        }
        // logArgs.push('--numstat');
        // fileStatArgs.push('--name-status');

        // Count only the number of lines in the log
        if (this.isWindows) {
            counterArgs.push('|', 'find', '/c', '/v', '""');
        }
        else {
            counterArgs.push('|', 'wc', '-l');
        }

        if (specificBranch) {
            logArgs.push(branch);
            fileStatArgs.push(branch);
            counterArgs.push(branch);
        }

        return { logArgs, fileStatArgs, counterArgs };
    }

    private getWorkspaceRootPath(): Promise<string> {
        return Promise.resolve('');
    }

    // tslint:disable-next-line:member-ordering
    constructor(private gitCmdExecutor: IGitCommandExecutor,
        private logParser: ILogParser, private isWindows: boolean = /^win/.test(process.platform)) {
    }

    public async  getGitRoot(): Promise<string> {
        if (!this.gitRootPath) {
            const workspaceRoot = await this.getWorkspaceRootPath();
            const gitRootPath = await this.gitCmdExecutor.exec(['rev-parse', '--show-toplevel'], workspaceRoot);
            this.gitRootPath = gitRootPath.trim();
        }
        return this.gitRootPath;
    }

    // tslint:disable-next-line:member-ordering
    public async getHeadHashes(): Promise<{ ref: string, hash: string }[]> {
        const fullHashArgs = ['show-ref'];
        const fullHashRefsOutput = await this.exec(fullHashArgs);
        return fullHashRefsOutput.split(/\r?\n/g)
            .filter(line => line.length > 0)
            .filter(line => line.indexOf('refs/heads/') > 0 || line.indexOf('refs/remotes/') > 0)
            .map(line => line.trim().split(' '))
            .filter(lineParts => lineParts.length > 1)
            .map(hashAndRef => { return { ref: hashAndRef[1], hash: hashAndRef[0] }; });
    }
    // tslint:disable-next-line:member-ordering
    public async getBranches(): Promise<Branch[]> {
        const output = await this.exec(['branch']);
        return output.split(/\r?\n/g)
            .filter(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const isCurrent = line.startsWith('*');
                const name = isCurrent ? line.substring(1).trim() : line;
                // tslint:disable-next-line:prefer-type-cast
                return {
                    name,
                    current: isCurrent
                } as Branch;
            });
    }
    public async getCurrentBranch(): Promise<string> {
        const args = ['rev-parse', '--abbrev-ref', 'HEAD'];
        return await this.exec(args);
    }
    public async getObjectHash(object: string): Promise<string> {

        // Get the hash of the given ref
        // E.g. git show --format=%H --shortstat remotes/origin/tyriar/xterm-v3
        const args = ['show', '--format=%H', '--shortstat', object];
        const output = await this.exec(args);
        return output.split(/\r?\n/g)[0].trim();
    }
    public async getRefsContainingCommit(hash: string): Promise<string[]> {
        const args = ['git', 'branch', '--all', '--contains', hash];
        const entries = await this.exec(args);
        return entries.split(/\r?\n/g)
            .map(line => line.trim())
            // Remove the '*' prefix from current branch
            .map(line => line.startsWith('*') ? line.substring(1) : line)
            // Remove the '->' from ref pointers (take first portion)
            .map(ref => ref.indexOf(' ') ? ref.split(' ')[0].trim() : ref);
    }
    public async getLogEntries(pageIndex: number = 0, pageSize: number = 100, branch: string = '', searchText: string = '', file?: Uri): Promise<LogEntries> {
        const args = await this.getLogArgs(pageIndex, pageSize, branch, searchText, file);

        const gitRootPathPromise = this.getGitRoot();
        const outputPromise = this.exec(args.logArgs);

        // Since we're using find and wc (shell commands, we need to execute the command in a shell)
        const countOutputPromise = this.execInShell(args.counterArgs);

        const values = await Promise.all([gitRootPathPromise, outputPromise, countOutputPromise]);
        const gitRepoPath = values[0];
        const output = values[1];
        const countOutput = values[2];
        const count = parseInt(countOutput.trim(), 10);

        // Run another git history, but get file stats instead of the changes
        // const outputWithFileModeChanges = await this.exec(args.fileStatArgs);
        // const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);
        const items = output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => {
                if (entry.length === 0) {
                    return;
                }
                return this.logParser.parse(gitRepoPath, entry, ITEM_ENTRY_SEPARATOR, STATS_SEPARATOR, LOG_FORMAT_ARGS);
            })
            .filter(logEntry => logEntry !== undefined)
            .map(logEntry => logEntry!);

        const headHashes = await this.getHeadHashes();
        const headHashesOnly = headHashes.map(item => item.hash);
        // tslint:disable-next-line:prefer-type-cast
        const headHashMap = new Map<string, string>(headHashes.map(item => [item.ref, item.hash] as [string, string]));

        items.forEach(async item => {
            // Check if this the very last commit of a branch
            // Just check if this is a head commit (if shows up in 'git show-ref')
            item.isLastCommit = headHashesOnly.indexOf(item.hash.full) >= 0;

            // Check if this commit has been merged into another branch
            // Do this only if this is a head commit (we don't care otherwise, only the graph needs it)
            if (!item.isLastCommit) {
                return;
            }
            const refsContainingThisCommit = await this.getRefsContainingCommit(item.hash.full);
            const hashesOfRefs = refsContainingThisCommit
                .filter(ref => headHashMap.has(ref))
                .map(ref => headHashMap.get(ref)!)
                // tslint:disable-next-line:possible-timing-attack
                .filter(hash => hash !== item.hash.full);
            // If we have hashes other than current, then yes it has been merged
            item.isThisLastCommitMerged = hashesOfRefs.length > 0;
        });

        // tslint:disable-next-line:no-unnecessary-local-variable
        const entries: LogEntries = {
            items,
            count
        };
        return entries;
    }

    public async getCommitDate(hash: string): Promise<Date | undefined> {
        const args = ['show', '--format=%ct', hash];
        const output = await this.exec(args);
        const lines = output.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {
            return undefined;
        }

        const unixTime = parseInt(lines[0], 10);
        if (isNaN(unixTime) || unixTime <= 0) {
            return undefined;
        }
        return new Date(unixTime * 1000);
    }
    public async getCommit(hash: string): Promise<LogEntry | undefined> {
        const numStartArgs = ['show', LOG_FORMAT, '--decorate=full', '--numstat', hash];
        const nameStatusArgs = ['show', `--format=${LOG_ENTRY_SEPARATOR}%n`, '--decorate=full', '--name-status', hash];

        const gitRootPath = await this.getGitRoot();
        const output = await this.exec(numStartArgs);

        // Run another git history, but get file stats instead of the changes
        const outputWithFileModeChanges = await this.exec(nameStatusArgs);
        const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);

        const entries = output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => {
                if (entry.trim().length === 0) {
                    return undefined;
                }
                return this.logParser.parse(gitRootPath, entry, ITEM_ENTRY_SEPARATOR, STATS_SEPARATOR, LOG_FORMAT_ARGS, entriesWithFileModeChanges[index]);
            })
            .filter(entry => entry !== undefined)
            .map(entry => entry!);

        return entries.length > 0 ? entries[0] : undefined;
    }
}
