import { ActionedUser, Avatar } from '../../types';
import { GitOriginType } from '../repository/types';

export const IAvatarProvider = Symbol('IAvatarProvider');

export interface IAvatarProvider {
    supported(remoteRepo: GitOriginType): boolean;
    getAvatar(user: ActionedUser): Promise<Avatar | undefined>;
}
