import axios, { AxiosProxyConfig } from 'axios';
import { inject, injectable } from 'inversify';
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

@injectable()
export class GithubAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    protected readonly httpProxy: string;
    public constructor( @inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.github);
    }
    protected async getAvatarImplementation(user: ActionedUser): Promise<Avatar | undefined> {
        let proxy: AxiosProxyConfig | undefined;
        if (this.httpProxy.length > 0) {
            const proxyUri = new URL(this.httpProxy);
            proxy = { host: proxyUri.hostname, port: proxyUri.port };
        }
        const searchByName = await axios.get(`https://api.github.com/search/users?q=${encodeURIComponent(user.name)}`, { proxy })
            .then((result: { data: GithubUserSearchResponse }) => {
                if (!result.data || !Array.isArray(result.data!.items) || result.data!.items.length === 0) {
                    return undefined;
                } else {
                    return {
                        url: result.data!.items[0].url,
                        avatarUrl: result.data!.items[0].avatar_url,
                        name: user.name,
                        email: user.email
                    };
                }
            }).catch(() => undefined);

        if (searchByName) {
            return searchByName;
        }

        return axios.get(`https://api.github.com/search/users?q=${encodeURIComponent(user.email)}`, { proxy })
            .then((result: { data: GithubUserSearchResponse }) => {
                if (!result || result.data || !Array.isArray(result.data!.items) || result.data!.items.length === 0) {
                    return undefined;
                } else {
                    return {
                        url: result.data!.items[0].url,
                        avatarUrl: result.data!.items[0].avatar_url,
                        name: user.name,
                        email: user.email
                    };
                }
            });
    }
}
