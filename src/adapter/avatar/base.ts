import { injectable, unmanaged } from 'inversify';
import { IStateStoreFactory } from '../../application/types/stateStore';
import { IWorkspaceService } from '../../application/types/workspace';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Avatar } from '../../types';
import { GitOriginType } from '../repository/types';
import { IAvatarProvider } from './types';

type CachedAvatar = Avatar & { dateTimeMs: number };

@injectable()
export abstract class BaseAvatarProvider implements IAvatarProvider {
    protected readonly httpProxy: string;
    public constructor(private serviceContainer: IServiceContainer, @unmanaged() private remoteRepoType: GitOriginType) {
        const workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        this.httpProxy = workspace.getConfiguration('http').get('proxy', '');
    }
    public async getAvatar(user: ActionedUser): Promise<Avatar | undefined> {
        const stateStoreFactory = this.serviceContainer.get<IStateStoreFactory>(IStateStoreFactory);
        const stateStore = stateStoreFactory.createStore();
        const key = `Avatar:${user.name}:${user.email}`;
        const cachedInfo = stateStore.has(key) ? await stateStore.get<CachedAvatar>(key)! : undefined;
        const retry = cachedInfo && !cachedInfo.url && (cachedInfo.dateTimeMs * 60 * 60 * 1000) < new Date().getTime();
        if (!cachedInfo || retry) {
            const avatar = await this.getAvatarImplementation(user);
            const url = avatar ? avatar.url : undefined;
            const avatarUrl = avatar ? avatar.avatarUrl : undefined;
            const dateTimeMs = new Date().getTime();
            stateStore.set<CachedAvatar>(key, { url, avatarUrl, dateTimeMs, name: user.name, email: user.email });
        }

        return stateStore.get<Avatar>(key);
    }
    public supported(remoteRepo: GitOriginType): boolean {
        return remoteRepo === this.remoteRepoType;
    }
    protected abstract getAvatarImplementation(user: ActionedUser): Promise<Avatar | undefined>;
}
