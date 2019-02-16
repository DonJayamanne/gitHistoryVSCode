import axios, { AxiosProxyConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { IStateStore, IStateStoreFactory } from '../../application/types/stateStore';
import { IServiceContainer } from '../../ioc/types';
import { Avatar, IGitService } from '../../types';
import { GitOriginType } from '../repository/types';
import { BaseAvatarProvider } from './base';
import { IAvatarProvider } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires
const { URL } = require('url');

type GithubUserSearchResponseItem = {
    'login': string;
    'id': number;
    'avatar_url': string;
    'gravatar_id': string;
    'url': string;
    'html_url': string;
    'followers_url': string;
    'following_url': string;
    'gists_url': string;
    'starred_url': string;
    'subscriptions_url': string;
    'organizations_url': string;
    'repos_url': string;
    'events_url': string;
    'received_events_url': string;
    'type': string;
    'site_admin': boolean;
    'score': number;
};

type GithubUserResponse = {
    'login': string;
    'id': number;
    'avatar_url': string;
    'gravatar_id': string;
    'url': string;
    'html_url': string;
    'followers_url': string;
    'following_url': string;
    'gists_url': string;
    'starred_url': string;
    'subscriptions_url': string;
    'organizations_url': string;
    'repos_url': string;
    'events_url': string;
    'received_events_url': string;
    'type': string;
    'site_admin': boolean;
    'name': string;
    'company': string;
    'blog': string;
    'location': string;
    'email': string;
    'hireable': boolean;
    'bio': string;
    'public_repos': number;
    'public_gists': number;
    'followers': number;
    'following': number;
    'created_at': string;
    'updated_at': string;
    'last_modified': string;
};

@injectable()
export class GithubAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    protected readonly httpProxy: string = '';
    private readonly stateStore: IStateStore;
    private get proxy(): AxiosProxyConfig | undefined {
        let proxy: AxiosProxyConfig | undefined;
        if (this.httpProxy.length > 0) {
            const proxyUri = new URL(this.httpProxy);
            proxy = { host: proxyUri.hostname, port: proxyUri.port };
        }
        return proxy;
    }
    public constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.github);

        const stateStoreFactory = this.serviceContainer.get<IStateStoreFactory>(IStateStoreFactory);
        this.stateStore = stateStoreFactory.createStore();
    }
    protected async getAvatarsImplementation(repository: IGitService): Promise<Avatar[]> {
        const remoteUrl = await repository.getOriginUrl();
        const remoteRepoPath = remoteUrl.replace(/.*?github.com\//,'');
        const contributors = await this.getContributors(remoteRepoPath);

        const githubUsers = await Promise.all(contributors.map(async user => {
            return await this.getUserByLogin(user.login);
        }));

        let avatars : Avatar[] = [];

        githubUsers.forEach(user => {
            if(!user) return;
            avatars.push({
                login: user.login,
                name: user.name,
                email: user.email,
                url: user.url,
                avatarUrl: user.avatar_url
            });
        });

        return avatars;
    }
    /**
     * Fetch the user details through Github API
     * @param loginName 
     */
    private async getUserByLogin(loginName: string) {
        const key = `GitHub:User:${loginName}`;

        const cachedUser = await this.stateStore.get<GithubUserResponse>(key);
        let headers = {};

        if(cachedUser) {
            // Use GitHub API with conditional check on last modified
            // to avoid API request rate limitation
            headers = {'If-Modified-Since': cachedUser.last_modified};
        }

        const proxy = this.proxy;
        const info = await axios.get(`https://api.github.com/users/${encodeURIComponent(loginName)}`, { proxy, headers })
            .then((result: { headers: any, data: GithubUserResponse }) => {
                if (!result.data || (!result.data.name && !result.data.login)) {
                    return;
                } else {
                    result.data.last_modified = result.headers['last-modified'];
                    return result.data;
                }
            }).catch(() => {
                // can either be '302 Not Modified' or any other error
                // in case of '302 Not Modified' this API request is not counted and returns nothing
            });
        
        if(info) {
            await this.stateStore.set(key, info);
            return info;
        } else {
            return cachedUser;
        }
    }

    /**
     * Fetch all constributors from the remote repository through Github API
     * @param repoPath relative repository path
     */
    private async getContributors(repoPath: string) {
        const proxy = this.proxy;
        const info = await axios.get(`https://api.github.com/repos/${repoPath}/contributors`, { proxy })
            .then((result: { data: GithubUserSearchResponseItem[] }) => {
                return result.data;
            });
        return info;
    }
}
