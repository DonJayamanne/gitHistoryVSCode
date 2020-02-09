import * as fs from 'fs-extra';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as tmp from 'tmp';
import { Uri } from 'vscode';
import { IWorkspaceService } from '../../application/types/workspace';
import { cache } from '../../common/cache';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Branch, CommittedFile, FsUri, Hash, IGitService, LogEntries, LogEntry } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { IFileStatParser, ILogParser } from '../parsers/types';
import { ITEM_ENTRY_SEPARATOR, LOG_ENTRY_SEPARATOR, LOG_FORMAT_ARGS } from './constants';
import { Repository } from './git.d';
import { GitOriginType } from './index';
import { IGitArgsService } from './types';

@injectable()
export class Git implements IGitService {
    constructor(private repo: Repository, @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService) {
    }

    public async getGitRoot(): Promise<string> {
        return this.repo.rootUri.fsPath;
    }
    public async getGitRelativePath(file: Uri | FsUri) {
        if (!path.isAbsolute(file.fsPath)) {
            return file.fsPath;
        }
        const gitRoot: string = await this.getGitRoot();
        return path.relative(gitRoot, file.fsPath).replace(/\\/g, '/');
    }
    public async getHeadHashes(): Promise<{ ref?: string; hash?: string }[]> {
        return this.repo.state.refs.filter(x => x.type <= 1).map(x =>  { return { ref: x.name, hash: x.commit }; });
    }
    public async getBranches(): Promise<Branch[]> {
        const currentBranchName = await this.getCurrentBranch();
        const gitRootPath = this.repo.rootUri.fsPath;
        const localBranches = this.repo.state.refs.filter(x => x.type === 0);

        return await Promise.all(localBranches.map(async x => {
            // tslint:disable-next-line:no-object-literal-type-assertion

            let originUrl = await this.getOriginUrl(x.name);
            let originType = await this.getOriginType(originUrl);

            return {
                gitRoot: gitRootPath,
                name: x.name,
                remote: originUrl,
                remoteType: originType,
                current: currentBranchName === x.name
            } as Branch;
        }));
    }
    public async getCurrentBranch(): Promise<string> {
        return this.repo.state.HEAD!.name || '';
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
    
    public async getOriginType(url?: string): Promise<GitOriginType | undefined> {
        if (!url) {
            url = await this.getOriginUrl();
        }

        if (url.indexOf('github.com') > 0) {
            return GitOriginType.github;
        } else if (url.indexOf('bitbucket') > 0) {
            return GitOriginType.bitbucket;
        } else if (url.indexOf('visualstudio') > 0) {
            return GitOriginType.vsts;
        }
        return undefined;
    }

    public async getOriginUrl(branchName?: string): Promise<string> {
        if (!branchName) {
            branchName = await this.getCurrentBranch();
        }
        
        const branch = await this.repo.getBranch(branchName);

        if (branch.upstream) {
            const remoteIndex = this.repo.state.remotes.findIndex(x => x.name === branch.upstream!.remote);
            return this.repo.state.remotes[remoteIndex].fetchUrl || '';
        }

        return '';
    }
    public async getRefsContainingCommit(hash: string): Promise<string[]> {
        // tslint:disable-next-line:possible-timing-attack
        return this.repo.state.refs.filter(x => x.commit === hash).map(x => x.name || '');
    }
    public async getLogEntries(pageIndex: number = 0, pageSize: number = 0, branch: string = '', searchText: string = '', file?: Uri, lineNumber?: number, author?: string): Promise<LogEntries> {
        if (pageSize <= 0) {
            // tslint:disable-next-line:no-parameter-reassignment
            const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
            pageSize = workspace.getConfiguration('gitHistory').get<number>('pageSize', 100);
        }
        const relativePath = file ? await this.getGitRelativePath(file) : undefined;
        const args = this.gitArgsService.getLogArgs(pageIndex, pageSize, branch, searchText, relativePath, lineNumber, author);

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
        //const headHashMap = new Map<string, string>(headHashes.map(item => [item.ref, item.hash] as [string, string]));

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
            /*const refsContainingThisCommit = await this.getRefsContainingCommit(item.hash.full);
            const hashesOfRefs = refsContainingThisCommit
                .filter(ref => headHashMap.has(ref))
                .map(ref => headHashMap.get(ref)!)
                // tslint:disable-next-line:possible-timing-attack
                .filter(hash => hash !== item.hash.full);
            // If we have hashes other than current, then yes it has been merged
            item.isThisLastCommitMerged = hashesOfRefs.length > 0;*/
        });

        // tslint:disable-next-line:no-suspicious-comment
        // @ts-ignore
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
        //const parentHashesArgs = this.gitArgsService.getCommitParentHashesArgs(hash);
        //const parentHashes = await this.exec(...parentHashesArgs);
        //const singleParent = parentHashes.trim().split(' ').filter(item => item.trim().length > 0).length === 1;

        const commitArgs = this.gitArgsService.getCommitArgs(hash);
        const nameStatusArgs = this.gitArgsService.getCommitNameStatusArgsForMerge(hash);

        const gitRootPath = await this.getGitRoot();
        const commitOutput = await this.exec(...commitArgs);

        const filesWithNumStat = commitOutput.split("\n\n", 2)[1];
        const filesWithNameStatus = await this.exec(...nameStatusArgs);

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
        //const gitRootPath = await this.getGitRoot();
        const filePath = typeof file === 'string' ? file : file.fsPath.toString();

        const content = await this.repo.show(hash, filePath);

        return new Promise<Uri>((resolve, reject) => {
            tmp.file({ postfix: path.extname(filePath) }, async (err: Error, tmpPath: string) => {
                if (err) {
                    return reject(err);
                }

                try {
                    const tmpFilePath = path.join(path.dirname(tmpPath), `${hash}${new Date().getTime()}${path.basename(tmpPath)}`).replace(/\\/g, '/');
                    const tmpFile = path.join(tmpFilePath, path.basename(filePath));
                    await fs.ensureDir(tmpFilePath);
                    await fs.writeFile(tmpFile, content);
                    resolve(Uri.file(tmpFile));
                } catch (ex) {
                    // tslint:disable-next-line:no-console
                    console.error('Git History: failed to get file contents (again)');
                    // tslint:disable-next-line:no-console
                    console.error(ex);
                    reject(ex);
                }
            });
        });
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
            short: hashes[1],
            full: hashes[0]
        };
    }

    public async cherryPick(hash: string): Promise<void> {
        await this.exec('cherry-pick', hash);
    }

    public async reset(hash: string, hard: boolean = false) : Promise<void> {
        await this.exec('reset', hard ? '--hard' : '--soft', hash);
    }

    public async checkout(hash: string) : Promise<void> {
        await this.exec('checkout', hash);
    }

    public async revertCommit(hash: string): Promise<void> {
        await this.exec('revert', '--no-edit', hash);
    }

    public async createBranch(branchName: string, hash: string): Promise<void> {
        await this.exec('checkout', '-b', branchName, hash);
    }
    public async createTag(tagName: string, hash: string): Promise<void> {
        await this.exec('tag', '-a', tagName, '-m', tagName, hash);
    }
    public async removeTag(tagName: string) {
        await this.exec('tag', '-d', tagName);
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
