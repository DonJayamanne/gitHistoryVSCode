import { injectable, unmanaged } from 'inversify';
import { IStateStore, IStateStoreFactory } from '../../application/types/stateStore';
import { IWorkspaceService } from '../../application/types/workspace';
import { IServiceContainer } from '../../ioc/types';
import { Avatar, AvatarResponse, IGitService } from '../../types';
import { GitOriginType } from '../repository/types';
import { IAvatarProvider } from './types';

@injectable()
export abstract class BaseAvatarProvider implements IAvatarProvider {
    protected readonly httpProxy: string;
    private readonly avatarStateStore: IStateStore;
    public constructor(
        protected serviceContainer: IServiceContainer,
        @unmanaged() private remoteRepoType: GitOriginType,
    ) {
        const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        this.httpProxy = workspace.getConfiguration('http').get('proxy', '');
        const stateStoreFactory = this.serviceContainer.get<IStateStoreFactory>(IStateStoreFactory);
        this.avatarStateStore = stateStoreFactory.createStore();
    }

    public async getAvatars(repository: IGitService): Promise<Avatar[]> {
        const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        const cacheExpiration = workspace.getConfiguration('gitHistory').get<number>('avatarCacheExpiration', 60); // in minutes (zero to disable cache)

        const remoteUrl = await repository.getOriginUrl();
        const key = `Git:Avatars:${remoteUrl}`;

        const cachedAvatars = await this.avatarStateStore.get<AvatarResponse>(key);

        const retry =
            cacheExpiration === 0 ||
            !cachedAvatars ||
            (cachedAvatars &&
                cachedAvatars.timestamp &&
                cachedAvatars.timestamp + cacheExpiration * 60 * 1000 < new Date().getTime());

        if (retry) {
            const avatars = await this.getAvatarsImplementation(repository);
            await this.avatarStateStore.set<AvatarResponse>(key, { timestamp: new Date().getTime(), items: avatars });
            return avatars;
        } else if (cachedAvatars) {
            return cachedAvatars.items;
        }

        return [];
    }
    public supported(remoteRepo: GitOriginType): boolean {
        return remoteRepo === this.remoteRepoType;
    }
    protected abstract getAvatarsImplementation(repository: IGitService): Promise<Avatar[]>;
}
