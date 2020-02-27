import * as fetch from 'node-fetch';
import { inject, injectable } from 'inversify';
import { IStateStore, IStateStoreFactory } from '../../application/types/stateStore';
import { IServiceContainer } from '../../ioc/types';
import { Avatar, IGitService } from '../../types';
import { GitOriginType } from '../repository/types';
import { BaseAvatarProvider } from './base';
import { IAvatarProvider } from './types';

type GithubUserSearchResponseItem = {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    score: number;
};

type GithubUserResponse = {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: string;
    blog: string;
    location: string;
    email: string;
    hireable: boolean;
    bio: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    lastModified: string;
};

@injectable()
export class GithubAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    private readonly stateStore: IStateStore;
    public constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.github);

        const stateStoreFactory = this.serviceContainer.get<IStateStoreFactory>(IStateStoreFactory);
        this.stateStore = stateStoreFactory.createStore();
    }
    protected async getAvatarsImplementation(repository: IGitService): Promise<Avatar[]> {
        const remoteUrl = await repository.getOriginUrl();
        const remoteRepoPath = remoteUrl.replace(/.*?github.com\//, '');
        const remoteRepoWithNoGitSuffix = remoteRepoPath.replace(/\.git\/?$/, '');
        const contributors = await this.getContributors(remoteRepoWithNoGitSuffix);

        const githubUsers = await Promise.all(
            contributors.map(async user => {
                return this.getUserByLogin(user.login);
            }),
        );

        const avatars: Avatar[] = [];

        githubUsers.forEach(user => {
            if (!user) {
                return;
            }
            avatars.push({
                login: user.login,
                name: user.name,
                email: user.email,
                url: user.url,
                avatarUrl: user.avatar_url,
            });
        });

        return avatars;
    }
    /**
     * Fetch the user details through Github API
     * @param loginName the user login name from github
     */
    private async getUserByLogin(loginName: string) {
        const key = `GitHub:User:${loginName}`;

        const cachedUser = await this.stateStore.get<GithubUserResponse>(key);
        let headers = {};

        if (cachedUser) {
            // Use GitHub API with conditional check on last modified
            // to avoid API request rate limitation
            headers = { 'If-Modified-Since': cachedUser.lastModified };
        }

        const info = await fetch(`https://api.github.com/users/${encodeURIComponent(loginName)}`, { headers })
            .then(response => response.json())
            .then((result: { headers: any; data: GithubUserResponse }) => {
                if (!result.data || (!result.data.name && !result.data.login)) {
                    return;
                } else {
                    result.data.lastModified = result.headers['last-modified'];
                    return result.data;
                }
            })
            .catch(() => {
                // can either be '302 Not Modified' or any other error
                // in case of '302 Not Modified' this API request is not counted and returns nothing
            });

        if (info) {
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
    private getContributors(repoPath: string) {
        const promise = fetch(`https://api.github.com/repos/${repoPath}/contributors`);

        return promise
            .then(response => response.json())
            .then(data => {
                return data as GithubUserSearchResponseItem[];
            });
    }
}
