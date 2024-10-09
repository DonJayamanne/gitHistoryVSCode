import { Repository } from './git.d';
import { GitOriginType } from '.';
import { captureTelemetry } from '../../common/telemetry';

export class GitRemoteService {
    constructor(private readonly repo: Repository) {}
    private get currentBranch(): string {
        return this.repo.state.HEAD!.name || '';
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

    @captureTelemetry()
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
