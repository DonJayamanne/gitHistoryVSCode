import { IServiceManager } from '../ioc/types';
import { GithubAvatarProvider } from './avatar/github';
import { GravatarAvatarProvider } from './avatar/gravatar';
import { IAvatarProvider } from './avatar/types';
import { GitCommandExecutor, IGitCommandExecutor } from './exec/index';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IGitCommandExecutor>(IGitCommandExecutor, GitCommandExecutor);
    serviceManager.add<IAvatarProvider>(IAvatarProvider, GithubAvatarProvider);
    serviceManager.add<IAvatarProvider>(IAvatarProvider, GravatarAvatarProvider);
}
