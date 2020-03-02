import { Avatar, IGitService } from '../../types';
import { GitOriginType } from '../repository/types';

export const IAvatarProvider = Symbol('IAvatarProvider');

export interface IAvatarProvider {
    supported(remoteRepo: GitOriginType): boolean;
    getAvatars(repository: IGitService): Promise<Avatar[]>;
}
