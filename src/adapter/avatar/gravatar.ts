import * as gravatar from 'gravatar';
import { inject, injectable } from 'inversify';
import { IServiceContainer } from '../../ioc/types';
import { ActionedUser, Avatar } from '../../types';
import { GitOriginType } from '../repository/types';
import { BaseAvatarProvider } from './base';
import { IAvatarProvider } from './types';

@injectable()
export class GravatarAvatarProvider extends BaseAvatarProvider implements IAvatarProvider {
    public constructor( @inject(IServiceContainer) serviceContainer: IServiceContainer) {
        super(serviceContainer, GitOriginType.any);
    }
    protected async getAvatarImplementation(user: ActionedUser): Promise<Avatar | undefined> {
        if (!user.email) {
            return;
        }
        const avatarUrl = gravatar.url(user.email);
        return {
            url: '',
            avatarUrl,
            name: user.name,
            email: user.email
        };
    }
}
