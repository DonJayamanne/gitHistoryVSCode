import { Repository } from './git.d';
import { Branch } from '../../types';
import { IGitCommandExecutor } from '..';
import { GitOriginType } from '.';

export class GitRemoteService {
    constructor(private readonly repo: Repository, private readonly gitCmdExecutor: IGitCommandExecutor) {}
    private get currentBranch(): string {
        return this.repo.state.HEAD!.name || '';
    }
    public async getBranchesWithRemotes(): Promise<Branch[]> {
        const gitRootPath = this.repo.rootUri.fsPath;
        const branches: Branch[] = [];

        await Promise.all(
            this.repo.state.remotes.map(async remote => {
                const branchNames = await this.getBranchesConfiguredForPullForRemote(remote.name);
                await Promise.all(
                    branchNames.map(async branchName => {
                        branches.push({
                            current: false,
                            gitRoot: gitRootPath,
                            name: branchName,
                            remote: remote.fetchUrl!,
                            remoteType: await this.getOriginType(remote.fetchUrl),
                        });
                    }),
                );
            }),
        );

        return branches;
    }

    public async getBranchesConfiguredForPullForRemote(remoteName: string): Promise<string[]> {
        const gitShowRemoteOutput = await this.gitCmdExecutor.exec(
            this.repo.rootUri.fsPath,
            ...['remote', 'show', remoteName, '-n'],
        );

        const lines = gitShowRemoteOutput
            .split(/\r?\n/g)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const startLineIndex = lines.findIndex(line => line.startsWith('Local branches configured for'));
        const endLineIndex = lines.findIndex(line => line.startsWith('Local ref configured for'));

        if (startLineIndex === -1 || endLineIndex == -1) {
            // TODO: Capture telemetry, something is wrong.
            return [];
        }
        if (startLineIndex > endLineIndex) {
            // TODO: Capture telemetry, something is wrong.
            return [];
        }

        // Branch name is first word in the line
        return lines.slice(startLineIndex + 1, endLineIndex).map(line => line.split(' ')[0]);
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
        branchName = branchName || this.currentBranch;

        const branch = await this.repo.getBranch(branchName);

        if (branch.upstream) {
            const remoteIndex = this.repo.state.remotes.findIndex(x => x.name === branch.upstream!.remote);
            return this.repo.state.remotes[remoteIndex].fetchUrl || '';
        }

        return '';
    }
}
