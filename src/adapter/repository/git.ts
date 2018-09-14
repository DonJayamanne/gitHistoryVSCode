import * as fs from 'fs-extra';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Writable } from 'stream';
import * as tmp from 'tmp';
import { Uri } from 'vscode';
import { IWorkspaceService } from '../../application/types/workspace';
import { cache } from '../../common/cache';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Branch, CommittedFile, FsUri, Hash, IGitService, LogEntries, LogEntry } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { IFileStatParser, ILogParser } from '../parsers/types';
import { ITEM_ENTRY_SEPARATOR, LOG_ENTRY_SEPARATOR, LOG_FORMAT_ARGS } from './constants';
import { GitOriginType } from './index';
import { IGitArgsService } from './types';

@injectable()
export class Git implements IGitService {
    private gitRootPath: string | undefined;
    private knownGitRoots: Set<string>;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer,
        private workspaceRoot: string,
        private resource: Uri,
        @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService) {
        this.knownGitRoots = new Set<string>();
    }
    public getHashCode() {
        return this.workspaceRoot;
    }

    @cache('IGitService')
    public async getGitRoot(): Promise<string> {
        if (this.gitRootPath) {
            return this.gitRootPath;
        }
        const gitRootPath = await this.gitCmdExecutor.exec(this.resource.fsPath, ...this.gitArgsService.getGitRootArgs());
        return this.gitRootPath = gitRootPath.split(/\r?\n/g)[0].trim();
    }
    @cache('IGitService', 5 * 60 * 1000)
    public async getGitRoots(rootDirectory?: string): Promise<string[]> {
        // Lets not enable support for sub modules for now.
        if (rootDirectory && (this.knownGitRoots.has(rootDirectory) || this.knownGitRoots.has(Uri.file(rootDirectory).fsPath))) {
            return [rootDirectory];
        }
        const rootDirectories: string[] = [];
        if (rootDirectory) {
            rootDirectories.push(rootDirectory);
        } else {
            const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
            const workspaceFolders = Array.isArray(workspace.workspaceFolders) ? workspace.workspaceFolders.map(item => item.uri.fsPath) : [];
            rootDirectories.push(...workspaceFolders);
        }
        if (rootDirectories.length === 0) {
            return [];
        }

        const gitFoldersList = await Promise.all(rootDirectories.map(item => this.getGitReposInFolder(item)));
        const gitRoots = new Set<string>();
        gitFoldersList
            .reduce<string[]>((aggregate, items) => { aggregate.push(...items); return aggregate; }, [])
            .forEach(item => {
                gitRoots.add(item);
                this.knownGitRoots.add(item);
            });
        return Array.from(gitRoots.values());
    }
    public async getGitRelativePath(file: Uri | FsUri) {
        if (!path.isAbsolute(file.fsPath)) {
            return file.fsPath;
        }
        const gitRoot: string = await this.getGitRoot();
        return path.relative(gitRoot, file.fsPath).replace(/\\/g, '/');
    }
    @cache('IGitService', 10 * 1000)
    public async getHeadHashes(): Promise<{ ref: string; hash: string }[]> {
        const fullHashArgs = ['show-ref'];
        const fullHashRefsOutput = await this.exec(...fullHashArgs);
        return fullHashRefsOutput.split(/\r?\n/g)
            .filter(line => line.length > 0)
            .filter(line => line.indexOf('refs/heads/') > 0 || line.indexOf('refs/remotes/') > 0)
            .map(line => line.trim().split(' '))
            .filter(lineParts => lineParts.length > 1)
            .map(hashAndRef => { return { ref: hashAndRef[1], hash: hashAndRef[0] }; });
    }

    @cache('IGitService', 60 * 1000)
    public async getAuthors(): Promise<ActionedUser[]> {
        const authorArgs = this.gitArgsService.getAuthorsArgs();
        const authors = await this.exec(...authorArgs);
        const dict = new Set<string>();
        return authors.split(/\r?\n/g)
            .map(line => line.trim())
            .filter(line => line.trim().length > 0)
            .map(line => line.substring(line.indexOf('\t') + 1))
            .map(line => {
                const indexOfEmailSeparator = line.indexOf('<');
                if (indexOfEmailSeparator === -1) {
                    return {
                        name: line.trim(),
                        email: ''
                    };
                } else {
                    const nameParts = line.split('<');
                    const name = nameParts.shift()!.trim();
                    const email = nameParts[0].substring(0, nameParts[0].length - 1).trim();
                    return {
                        name,
                        email
                    };
                }
            })
            .filter(item => {
                if (dict.has(item.name)) {
                    return false;
                }
                dict.add(item.name);
                return true;
            })
            .sort((a, b) => a.name > b.name ? 1 : -1);
    }

    // tslint:disable-next-line:no-suspicious-comment
    // TODO: We need a way of clearing this cache, if a new branch is created.
    @cache('IGitService', 30 * 1000)
    public async getBranches(): Promise<Branch[]> {
        const output = await this.exec('branch');
        const gitRootPath = await this.getGitRoot();
        return output.split(/\r?\n/g)
            .filter(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const isCurrent = line.startsWith('*');
                const name = isCurrent ? line.substring(1).trim() : line.trim();
                return {
                    gitRoot: gitRootPath,
                    name,
                    current: isCurrent
                };
            });
    }
    // tslint:disable-next-line:no-suspicious-comment
    // TODO: We need a way of clearing this cache, if a new branch is created.
    @cache('IGitService', 30 * 1000)
    public async getCurrentBranch(): Promise<string> {
        const args = this.gitArgsService.getCurrentBranchArgs();
        const branch = await this.exec(...args);
        return branch.split(/\r?\n/g)[0].trim();
    }
    @cache('IGitService')
    public async getObjectHash(object: string): Promise<string> {
        // Get the hash of the given ref
        // E.g. git show --format=%H --shortstat remotes/origin/tyriar/xterm-v3
        const args = this.gitArgsService.getObjectHashArgs(object);
        const output = await this.exec(...args);
        return output.split(/\r?\n/g)[0].trim();
    }
    @cache('IGitService')
    public async getOriginType(): Promise<GitOriginType | undefined> {
        try {
            const remoteName = await this.exec('status', '-sb').then((branchDetails) => {
                const matchResult = branchDetails.match(/.*\.\.\.(.*)\//);
                return matchResult && matchResult[1] ? matchResult[1] : 'origin';
            });

            return await this.exec('remote', 'get-url', remoteName)
                .then(url => {
                    if (url.indexOf('github.com') > 0) {
                        return GitOriginType.github;
                    } else if (url.indexOf('bitbucket') > 0) {
                        return GitOriginType.bitbucket;
                    } else if (url.indexOf('visualstudio') > 0) {
                        return GitOriginType.vsts;
                    } else {
                        return undefined;
                    }
                });
        } catch {
            return;
        }
    }
    public async getRefsContainingCommit(hash: string): Promise<string[]> {
        const args = this.gitArgsService.getRefsContainingCommitArgs(hash);
        const entries = await this.exec(...args);
        return entries.split(/\r?\n/g)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            // Remove the '*' prefix from current branch
            .map(line => line.startsWith('*') ? line.substring(1) : line)
            // Remove the '->' from ref pointers (take first portion)
            .map(ref => ref.indexOf(' ') ? ref.split(' ')[0].trim() : ref);
    }
    public async getLogEntries(pageIndex: number = 0, pageSize: number = 0, branch: string = '', searchText: string = '', file?: Uri, lineNumber?: number, author?: string): Promise<LogEntries> {
        if (pageSize <= 0) {
            // tslint:disable-next-line:no-parameter-reassignment
            const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
            pageSize = workspace.getConfiguration('gitHistory').get<number>('pageSize', 100);
        }
        const relativePath = file ? await this.getGitRelativePath(file) : undefined;
        const args = await this.gitArgsService.getLogArgs(pageIndex, pageSize, branch, searchText, relativePath, lineNumber, author);

        const gitRootPathPromise = this.getGitRoot();
        const outputPromise = this.exec(...args.logArgs);

        // tslint:disable-next-line:no-suspicious-comment
        // TODO: Disabled due to performance issues https://github.com/DonJayamanne/gitHistoryVSCode/issues/195
        // // Since we're using find and wc (shell commands, we need to execute the command in a shell)
        // const countOutputPromise = this.execInShell(...args.counterArgs)
        //     .then(countValue => parseInt(countValue.trim(), 10))
        //     .catch(ex => {
        //         console.error('Git History: Failed to get commit count');
        //         console.error(ex);
        //         return -1;
        //     });
        const count = -1;
        const [gitRepoPath, output] = await Promise.all([gitRootPathPromise, outputPromise]);

        // Run another git history, but get file stats instead of the changes
        // const outputWithFileModeChanges = await this.exec(args.fileStatArgs);
        // const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);
        const items = output
            .split(LOG_ENTRY_SEPARATOR)
            .map(entry => {
                if (entry.length === 0) {
                    return;
                }
                return this.logParser.parse(gitRepoPath, entry, ITEM_ENTRY_SEPARATOR, LOG_FORMAT_ARGS);
            })
            .filter(logEntry => logEntry !== undefined)
            .map(logEntry => logEntry!);

        const headHashes = await this.getHeadHashes();
        const headHashesOnly = headHashes.map(item => item.hash);
        // tslint:disable-next-line:prefer-type-cast
        const headHashMap = new Map<string, string>(headHashes.map(item => [item.ref, item.hash] as [string, string]));

        items.forEach(async item => {
            item.gitRoot = gitRepoPath;
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

        // tslint:disable-next-line:no-suspicious-comment
        // TODO:Fix
        // tslint:disable-next-line:no-object-literal-type-assertion
        return {
            items,
            count,
            branch,
            file,
            pageIndex,
            pageSize,
            searchText
        } as LogEntries;
    }
    @cache('IGitService')
    public async getHash(hash: string): Promise<Hash> {
        const hashes = await this.exec('show', '--format=%H-%h', '--no-patch', hash);
        const parts = hashes.split(/\r?\n/g).filter(item => item.length > 0)[0].split('-');
        return {
            full: parts[0],
            short: parts[1]
        };
    }
    @cache('IGitService')
    public async getCommitDate(hash: string): Promise<Date | undefined> {
        const args = this.gitArgsService.getCommitDateArgs(hash);
        const output = await this.exec(...args);
        const lines = output.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {
            return;
        }

        const unixTime = parseInt(lines[0], 10);
        if (isNaN(unixTime) || unixTime <= 0) {
            return;
        }
        return new Date(unixTime * 1000);
    }
    @cache('IGitService')
    public async getCommit(hash: string): Promise<LogEntry | undefined> {
        const parentHashesArgs = this.gitArgsService.getCommitParentHashesArgs(hash);
        const parentHashes = await this.exec(...parentHashesArgs);
        const singleParent = parentHashes.trim().split(' ').filter(item => item.trim().length > 0).length === 1;

        const commitArgs = this.gitArgsService.getCommitArgs(hash);
        const numStartArgs = singleParent ? this.gitArgsService.getCommitWithNumStatArgs(hash) : this.gitArgsService.getCommitWithNumStatArgsForMerge(hash);
        const nameStatusArgs = singleParent ? this.gitArgsService.getCommitNameStatusArgs(hash) : this.gitArgsService.getCommitNameStatusArgsForMerge(hash);

        const gitRootPathPromise = await this.getGitRoot();
        const commitOutputPromise = await this.exec(...commitArgs);
        const filesWithNumStatPromise = await this.exec(...numStartArgs);
        const filesWithNameStatusPromise = await this.exec(...nameStatusArgs);

        const values = await Promise.all([gitRootPathPromise, commitOutputPromise, filesWithNumStatPromise, filesWithNameStatusPromise]);
        const gitRootPath = values[0];
        const commitOutput = values[1];
        const filesWithNumStat = values[2];
        const filesWithNameStatus = values[3];

        const entries = commitOutput
            .split(LOG_ENTRY_SEPARATOR)
            .map(entry => {
                if (entry.trim().length === 0) {
                    return undefined;
                }
                return this.logParser.parse(gitRootPath, entry, ITEM_ENTRY_SEPARATOR, LOG_FORMAT_ARGS, filesWithNumStat, filesWithNameStatus);
            })
            .filter(entry => entry !== undefined)
            .map(entry => entry!);

        return entries.length > 0 ? entries[0] : undefined;
    }

    @cache('IGitService')
    public async getCommitFile(hash: string, file: Uri | string): Promise<Uri> {
        const gitRootPath = await this.getGitRoot();
        const filePath = typeof file === 'string' ? file : file.fsPath.toString();

        return new Promise<Uri>((resolve, reject) => {
            tmp.file({ postfix: path.extname(filePath) }, async (err: Error, tmpPath: string) => {
                if (err) {
                    return reject(err);
                }
                try {
                    // Sometimes the damn file is in use, lets create a new one everytime.
                    const tmpFilePath = path.join(path.dirname(tmpPath), `${hash}${new Date().getTime()}${path.basename(tmpPath)}`).replace(/\\/g, '/');
                    const tmpFile = path.join(tmpFilePath, path.basename(filePath));
                    await fs.ensureDir(tmpFilePath);
                    const relativeFilePath = path.relative(gitRootPath, filePath);
                    const fsStream = fs.createWriteStream(tmpFile);
                    await this.execBinary(fsStream, 'show', `${hash}:${relativeFilePath.replace(/\\/g, '/')}`);
                    fsStream.end();
                    resolve(Uri.file(tmpFile));
                } catch (ex) {
                    console.error('Git History: failed to get file contents (again)');
                    console.error(ex);
                    reject(ex);
                }
            });
        });
    }
    public async getCommitFileContent(hash: string, file: Uri | string): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        const filePath = typeof file === 'string' ? file : file.fsPath.toString();
        const relativeFilePath = path.relative(gitRootPath, filePath);
        return this.exec('show', `${hash}:${relativeFilePath.replace(/\\/g, '/')}`);
    }
    @cache('IGitService')
    public async getDifferences(hash1: string, hash2: string): Promise<CommittedFile[]> {
        const numStartArgs = this.gitArgsService.getDiffCommitWithNumStatArgs(hash1, hash2);
        const nameStatusArgs = this.gitArgsService.getDiffCommitNameStatusArgs(hash1, hash2);

        const gitRootPathPromise = this.getGitRoot();
        const filesWithNumStatPromise = this.exec(...numStartArgs);
        const filesWithNameStatusPromise = this.exec(...nameStatusArgs);

        const values = await Promise.all([gitRootPathPromise, filesWithNumStatPromise, filesWithNameStatusPromise]);
        const gitRootPath = values[0];
        const filesWithNumStat = values[1];
        const filesWithNameStatus = values[2];

        const fileStatParser = this.serviceContainer.get<IFileStatParser>(IFileStatParser);
        return fileStatParser.parse(gitRootPath, filesWithNumStat.split(/\r?\n/g), filesWithNameStatus.split(/\r?\n/g));
    }
    @cache('IGitService')
    public async getPreviousCommitHashForFile(hash: string, file: Uri): Promise<Hash> {
        const gitRootPath = await this.getGitRoot();
        const relativeFilePath = path.relative(gitRootPath, file.fsPath);
        const args = this.gitArgsService.getPreviousCommitHashForFileArgs(hash, relativeFilePath);
        const output = await this.exec(...args);
        const hashes = output.split(/\r?\n/g).filter(item => item.length > 0)[0].split('-');

        return {
            short: hashes[1]!,
            full: hashes[0]!
        };
    }

    public async cherryPick(hash: string): Promise<void> {
        await this.exec('cherry-pick', hash);
    }

    public async revertCommit(hash: string): Promise<void> {
        await this.exec('revert', '--no-edit', hash);
    }

    public async createBranch(branchName: string, hash: string): Promise<void> {
        await this.exec('checkout', '-b', branchName, hash);
    }
    public async merge(hash: string): Promise<void> {
        await this.exec('merge', hash);
    }
    public async rebase(hash: string): Promise<void> {
        await this.exec('rebase', hash);
    }
    private async exec(...args: string[]): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        return this.gitCmdExecutor.exec(gitRootPath, ...args);
    }
    private async execBinary(destination: Writable, ...args: string[]): Promise<void> {
        const gitRootPath = await this.getGitRoot();
        return this.gitCmdExecutor.exec({ cwd: gitRootPath, encoding: 'binary' }, destination, ...args);
    }
    private async getGitReposInFolder(dir: string): Promise<string[]> {
        return new Promise<string[]>(resolve => {
            fs.readdir(dir, async (err, filesAndFolders) => {
                if (err) {
                    return resolve([]);
                }
                // Lets ignore folders begining with '.' (hopeufully no one will have them).
                // Ignore python virtual environments, etc.
                const filteredItems = filesAndFolders
                    .filter(item => !item.startsWith('.'))
                    .map(item => path.join(dir, item));
                filteredItems.push(dir);

                const folders = await Promise.all<string>(filteredItems.filter(async item => (await fs.stat(item)).isDirectory()));
                const gitRootArgs = this.gitArgsService.getGitRootArgs();
                const gitRoots = (await Promise.all(folders.map(async item => {
                    try {
                        const result = await this.gitCmdExecutor.exec(item, ...gitRootArgs);
                        return path.normalize(result.split(/\r?\n/g)[0].trim());
                    } catch {
                        return;
                    }
                })))
                    .filter(item => !!item)
                    .map(item => item!);

                resolve(gitRoots);
            });
        });
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
}
