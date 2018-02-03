import axios, { AxiosProxyConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { IStateStore, IStateStoreFactory } from '../../application/types/stateStore';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Avatar } from '../../types';
import { GitOriginType } from '../repository/types';
import { BaseAvatarProvider } from './base';
import { IAvatarProvider } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires
const { URL } = require('url');

type GithubUserSearchResponse = {
    'total_count': number;
    'items': [
        {
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
        }
    ];
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
};

@injectable()
export class GithubAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    protected readonly httpProxy: string;
    private readonly stateStore: IStateStore;
    private get proxy(): AxiosProxyConfig | undefined {
        let proxy: AxiosProxyConfig | undefined;
        if (this.httpProxy.length > 0) {
            const proxyUri = new URL(this.httpProxy);
            proxy = { host: proxyUri.hostname, port: proxyUri.port };
        }
        return proxy;
    }
    public constructor( @inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.github);

        const stateStoreFactory = this.serviceContainer.get<IStateStoreFactory>(IStateStoreFactory);
        this.stateStore = stateStoreFactory.createStore();
    }
    protected async getAvatarImplementation(user: ActionedUser): Promise<Avatar | undefined> {
        const matchedLogins = await this.findMatchingLogins(user);
        if (!Array.isArray(matchedLogins)) {
            return;
        }
        const userInfo = await this.findLoginWithSameNameAndEmail(user, matchedLogins);
        if (!userInfo) {
            return;
        }
        return {
            url: userInfo.url,
            avatarUrl: userInfo.avatar_url,
            name: user.name,
            email: user.email
        };
    }
    private async getUserByLogin(loginName: string) {
        const key = `GitHub:User:LoginName${loginName}`;

        if (this.stateStore.has(key)) {
            const cachedInfo = await this.stateStore.get<GithubUserResponse>(key);
            if (cachedInfo) {
                return cachedInfo;
            }
        }

        const proxy = this.proxy;
        const info = await axios.get(`https://api.github.com/users/${encodeURIComponent(loginName)}`, { proxy })
            .then((result: { data: GithubUserResponse }) => {
                if (!result.data || !result.data.name) {
                    return;
                } else {
                    return result.data;
                }
            });

        await this.stateStore.set(key, info);
        return info;
    }
    private async findLoginWithSameNameAndEmail(user: ActionedUser, logins: string[]) {
        const matchedUsers: GithubUserResponse[] = [];
        for (const loginName of logins) {
            const userInfo = await this.getUserByLogin(loginName);
            if (userInfo && userInfo.name === user.name) {
                if (userInfo.email && user.email && userInfo.email !== user.email) {
                    continue;
                }
                matchedUsers.push(userInfo);
            }
        }

        // Return only if there's exactly one match
        return matchedUsers.length === 0 ? matchedUsers[0] : undefined;
    }
    private async searchLogins(cacheKey: string, searchValue: string) {
        if (this.stateStore.has(cacheKey)) {
            const cachedInfo = await this.stateStore.get(cacheKey);
            if (cachedInfo) {
                return cachedInfo;
            }
        }
        const proxy = this.proxy;
        const searchResult = await axios.get(`https://api.github.com/search/users?q=${encodeURIComponent(searchValue)}`, { proxy })
            .then((result: { data: GithubUserSearchResponse }) => {
                if (!result.data || !Array.isArray(result.data!.items) || result.data!.items.length === 0) {
                    return undefined;
                } else {
                    return result.data!.items.map(item => item.login);
                }
            });

        await this.stateStore.set(cacheKey, searchResult);
        return searchResult;
    }
    private async findMatchingLogins(user: ActionedUser) {
        const searchByName = await this.searchLogins(`GitHub:Users:Search:Name${user.name}`, user.name);
        if (searchByName) {
            return searchByName;
        }

        if (!user.email) {
            return;
        }
        return this.searchLogins(`GitHub:Users:Search:Email${user.email}`, user.email);
    }
}
