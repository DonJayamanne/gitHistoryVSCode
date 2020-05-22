import * as fs from 'fs-extra';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as tmp from 'tmp';
import * as vscode from 'vscode';
import { cache } from '../../common/cache';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Branch, CommittedFile, Hash, IGitService, LogEntries, LogEntry, Ref, FsUri } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { IFileStatParser, ILogParser } from '../parsers/types';
import { ITEM_ENTRY_SEPARATOR, LOG_ENTRY_SEPARATOR, LOG_FORMAT_ARGS } from './constants';
import { Repository, RefType } from './git.d';
import { GitOriginType } from './index';
import { IGitArgsService } from './types';
import { GitRemoteService } from './gitRemoteService';
import { captureTelemetry } from '../../common/telemetry';

@injectable()
export class Git implements IGitService {
    private refHashesMap: Map<string, string> = new Map<string, string>();
    private readonly remotesService: GitRemoteService;
    constructor(
        private repo: Repository,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
    ) {
        this.remotesService = new GitRemoteService(repo, this.gitCmdExecutor);
    }

    /**
     * Used to differentiate between repository being cached using the @cache decorator
     */
    public getHashCode(): string {
        return `:${this.getGitRoot()}`;
    }

    public getGitRoot(): string {
        return this.repo.rootUri.fsPath;
    }
    public getGitRelativePath(file: vscode.Uri) {
        if (!path.isAbsolute(file.fsPath)) {
            return file.fsPath;
        }
        const gitRoot: string = this.getGitRoot();
        const filerealpath: string = fs.realpathSync(file.fsPath);
        return path.relative(gitRoot, filerealpath).replace(/\\/g, '/');
    }
    public getHeadHashes(): { ref?: string; hash?: string }[] {
        return this.repo.state.refs
            .filter(x => x.type <= 1)
            .map(x => {
                return { ref: x.name, hash: x.commit };
            });
    }

    public getDetachedHash(): string | undefined {
        return this.repo.state.HEAD!.name === undefined ? this.repo.state.HEAD!.commit : undefined;
    }

    @captureTelemetry()
    public async getBranches(withRemote = false): Promise<Branch[]> {
        const gitRoot = this.getGitRoot();

        // get only the local branches
        const branches = await this.repo.getBranches({ remote: withRemote });

        return Promise.all(
            branches.map(async r => {
                let remoteUrl: string | undefined = undefined;

                // fetch the remote from local branch using upstreamRef (received only with getBranch)
                const remoteName = (await this.repo.getBranch(r.name || 'master')).upstream?.remote;

                if (remoteName) {
                    remoteUrl = this.repo.state.remotes.find(x => x.name === remoteName)?.fetchUrl;
                }

                const originType = await this.remotesService.getOriginType(remoteUrl);

                return {
                    gitRoot: gitRoot,
                    name: r.name,
                    remote: remoteUrl,
                    remoteType: originType,
                    current: this.getCurrentBranch() === r.name,
                } as Branch;
            }),
        );
    }

    public getCurrentBranch(): string {
        return this.repo.state.HEAD!.name || '';
    }

    @cache('IGitService', 60 * 1000)
    @captureTelemetry()
    public async getAuthors(): Promise<ActionedUser[]> {
        const authorArgs = this.gitArgsService.getAuthorsArgs();
        const authors = await this.exec(...authorArgs);
        const dict = new Set<string>();
        return authors
            .split(/\r?\n/g)
            .map(line => line.trim())
            .filter(line => line.trim().length > 0)
            .map(line => line.substring(line.indexOf('\t') + 1))
            .map(line => {
                const indexOfEmailSeparator = line.indexOf('<');
                if (indexOfEmailSeparator === -1) {
                    return {
                        name: line.trim(),
                        email: '',
                    };
                } else {
                    const nameParts = line.split('<');
                    const name = nameParts.shift()!.trim();
                    const email = nameParts[0].substring(0, nameParts[0].length - 1).trim();
                    return {
                        name,
                        email,
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
            .sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    @captureTelemetry()
    public async getOriginType(url?: string): Promise<GitOriginType | undefined> {
        return this.remotesService.getOriginType(url);
    }

    @captureTelemetry()
    public async getOriginUrl(branchName?: string): Promise<string> {
        return this.remotesService.getOriginUrl(branchName);
    }

    /**
     * Used to load dereferenced hashes for (annotation) tags
     *
     * This is used in vscode versions prior to 1.52 because
     * annotation references to not correct point to the assocated commit
     *
     * See https://github.com/microsoft/vscode/issues/92146
     */
    private async loadDereferenceHashes() {
        const vsCodeVersionNumber = parseFloat(vscode.version);

        if (vsCodeVersionNumber >= 1.52) {
            // skip it when vscode.git extension correctly dereferences the commit id
            return;
        }

        this.refHashesMap.clear();
        const tags = this.repo.state.refs.filter(x => x.type === RefType.Tag);

        if (tags.length === 0) {
            return;
        }

        const tagNames = tags.map(x => {
            // use the dereferenced hash for annotated tags
            // this also works for non annotated tags
            return x.name! + '^{}';
        });

        const maxTagNamesLength = 500;
        let result: string;
        if (tagNames.length > maxTagNamesLength) {
            const tagNamesChunks: Array<Array<string>> = [];
            while (tagNames.length) {
                tagNamesChunks.push(tagNames.splice(0, maxTagNamesLength));
            }
            result = await Promise.all(
                tagNamesChunks.map(tagNamesChunk => this.exec(...['rev-parse', ...tagNamesChunk])),
            ).then(resultChunks => resultChunks.join(''));
        } else {
            result = await this.exec(...['rev-parse', ...tagNames]);
        }

        result
            .trim()
            .split(/\r\n|\n/)
            .forEach((x, i) => {
                this.refHashesMap.set(tags[i].name!, x);
            });
    }

    public getRefsContainingCommit(hash: string): Ref[] {
        return this.repo.state.refs
            .filter(x => (x.type === RefType.Tag && this.refHashesMap.get(x.name!) === hash) || x.commit === hash)
            .map(x => {
                return { type: x.type as any, name: x.name } as Ref;
            });
    }

    @captureTelemetry()
    public async getLogEntries(
        startIndex = 0,
        stopIndex = 0,
        branches: string[] = [],
        searchText = '',
        file?: vscode.Uri,
        lineNumber?: number,
        author?: string,
    ): Promise<LogEntries> {
        branches = Array.isArray(branches) ? branches : [];
        const relativePath = file ? this.getGitRelativePath(file) : undefined;

        const args = this.gitArgsService.getLogArgs(
            startIndex,
            stopIndex,
            branches,
            searchText,
            relativePath,
            lineNumber,
            author,
        );

        const gitRepoPath = this.getGitRoot();
        const countPromise = lineNumber
            ? Promise.resolve(-1)
            : this.exec(...args.counterArgs).then(value => parseInt(value));
        ``;

        const [output] = await Promise.all([this.exec(...args.logArgs), this.loadDereferenceHashes()]);

        const items = output
            .split(LOG_ENTRY_SEPARATOR)
            .map(entry => {
                if (entry.length === 0) {
                    return;
                }
                return this.logParser.parse(gitRepoPath, entry, ITEM_ENTRY_SEPARATOR, LOG_FORMAT_ARGS);
            })
            .filter(logEntry => logEntry !== undefined)
            .map(logEntry => {
                // fill the refs from native git extension
                logEntry!.refs = this.getRefsContainingCommit(logEntry!.hash.full);
                return logEntry!;
            });

        const headHashes = this.getHeadHashes();
        const count = await countPromise;
        const headHashesOnly = headHashes.map(item => item.hash);

        items
            .filter(x => headHashesOnly.indexOf(x.hash.full) > -1)
            .forEach(item => {
                item.isLastCommit = true;
            });

        // @ts-ignore
        return {
            items,
            count,
            branches,
            file,
            startIndex,
            stopIndex,
            searchText,
        } as LogEntries;
    }

    @captureTelemetry()
    public async getCommit(hash: string, withRefs = false): Promise<LogEntry | undefined> {
        const commitArgs = this.gitArgsService.getCommitArgs(hash);
        const nameStatusArgs = this.gitArgsService.getCommitNameStatusArgsForMerge(hash);

        const gitRootPath = this.getGitRoot();
        const commitOutput = await this.exec(...commitArgs);

        const filesWithNumStat = commitOutput.slice(
            commitOutput.lastIndexOf(ITEM_ENTRY_SEPARATOR) + ITEM_ENTRY_SEPARATOR.length,
        );
        const filesWithNameStatus = await this.exec(...nameStatusArgs);

        const entries = commitOutput
            .split(LOG_ENTRY_SEPARATOR)
            .map(entry => {
                if (entry.trim().length === 0) {
                    return undefined;
                }
                return this.logParser.parse(
                    gitRootPath,
                    entry,
                    ITEM_ENTRY_SEPARATOR,
                    LOG_FORMAT_ARGS,
                    filesWithNumStat,
                    filesWithNameStatus,
                );
            })
            .filter(entry => entry !== undefined)
            .map(entry => entry!);

        if (entries.length > 0) {
            if (withRefs) {
                entries[0].refs = this.getRefsContainingCommit(hash);
            }
            return entries[0];
        }

        return undefined;
    }

    @cache('IGitService')
    @captureTelemetry()
    public async getCommitFile(hash: string, file: FsUri | string): Promise<vscode.Uri> {
        //const gitRootPath = await this.getGitRoot();
        const filePath = typeof file === 'string' ? file : file.path.toString();

        const content = await this.repo.buffer(hash, filePath);

        return new Promise<vscode.Uri>((resolve, reject) => {
            tmp.file({ postfix: path.extname(filePath) }, async (err: Error, tmpPath: string) => {
                if (err) {
                    return reject(err);
                }

                try {
                    const tmpFilePath = path
                        .join(path.dirname(tmpPath), `${hash}${new Date().getTime()}${path.basename(tmpPath)}`)
                        .replace(/\\/g, '/');
                    const tmpFile = path.join(tmpFilePath, path.basename(filePath));
                    await fs.ensureDir(tmpFilePath);
                    await fs.writeFile(tmpFile, content);
                    resolve(vscode.Uri.file(tmpFile));
                } catch (ex) {
                    console.error('Git History: failed to get file contents (again)');
                    console.error(ex);
                    reject(ex);
                }
            });
        });
    }

    @cache('IGitService')
    @captureTelemetry()
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
    @captureTelemetry()
    public async getPreviousCommitHashForFile(hash: string, file: FsUri): Promise<Hash> {
        const gitRootPath = await this.getGitRoot();
        const relativeFilePath = path.relative(gitRootPath, file.path);
        const args = this.gitArgsService.getPreviousCommitHashForFileArgs(hash, relativeFilePath);
        const output = await this.exec(...args);
        const hashes = output
            .split(/\r?\n/g)
            .filter(item => item.length > 0)[0]
            .split('-');

        return {
            short: hashes[1],
            full: hashes[0],
        };
    }

    @captureTelemetry()
    public async cherryPick(hash: string): Promise<void> {
        await this.exec('cherry-pick', hash);
    }

    @captureTelemetry()
    public async reset(hash: string, hard = false): Promise<void> {
        await this.exec('reset', hard ? '--hard' : '--soft', hash);
    }

    @captureTelemetry()
    public async checkout(hash: string): Promise<void> {
        await this.repo.checkout(hash);
    }

    @captureTelemetry()
    public async revertCommit(hash: string): Promise<void> {
        await this.exec('revert', '--no-edit', hash);
    }

    @captureTelemetry()
    public async createBranch(branchName: string, hash: string): Promise<void> {
        try {
            await this.repo.createBranch(branchName, false, hash);
        } catch (ex) {
            throw ex.stderr;
        }
    }

    @captureTelemetry()
    public async createTag(tagName: string, hash: string): Promise<string> {
        const result = await this.exec('tag', '-a', tagName, '-m', tagName, hash);
        // force git extension API to update repository refs
        await this.repo.status();
        return result;
    }

    @captureTelemetry()
    public async removeTag(tagName: string) {
        await this.exec('tag', '-d', tagName);
        await this.repo.status();
        this.refHashesMap.delete(tagName);
    }

    @captureTelemetry()
    public async removeBranch(branchName: string) {
        try {
            await this.repo.deleteBranch(branchName);
        } catch (ex) {
            throw ex.stderr;
        }
    }

    @captureTelemetry()
    public async removeRemoteBranch(remoteBranchName: string) {
        const pathes = remoteBranchName.split('/');
        const remote = pathes.shift() as string;
        const branchName = pathes.join('/');

        await this.repo.push(remote, `:${branchName}`);
    }

    @captureTelemetry()
    public async merge(hash: string): Promise<void> {
        await this.exec('merge', hash);
    }

    @captureTelemetry()
    public async rebase(hash: string): Promise<void> {
        await this.exec('rebase', hash);
    }

    private async exec(...args: string[]): Promise<string> {
        const gitRootPath = this.getGitRoot();
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
