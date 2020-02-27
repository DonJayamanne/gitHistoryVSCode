import * as gravatar from 'gravatar';
import { inject, injectable } from 'inversify';
import { IServiceContainer } from '../../ioc/types';
import { Avatar, IGitService } from '../../types';
import { GitOriginType } from '../repository/types';
import { BaseAvatarProvider } from './base';
import { IAvatarProvider } from './types';

@injectable()
export class GravatarAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    public constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.any);
    }
    protected async getAvatarsImplementation(repository: IGitService): Promise<Avatar[]> {
        const authors = await repository.getAuthors();

        return authors.map(user => {
            return {
                login: user.name,
                url: '',
                avatarUrl: gravatar.url(user.email, { protocol: 'https' }),
                name: user.name,
                email: user.email,
            };
        });
    }
}
