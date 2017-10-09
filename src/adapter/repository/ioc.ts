import { ContainerModule, interfaces } from 'inversify';
import { IGitService, IGitServiceFactory } from '../../types';
import { TYPES } from './constants';
import { GitServiceFactory } from './factory';
import { Git } from './git';
import { GitArgsService } from './gitArgsService';
import { IGitArgsService } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGitService>(TYPES.IGit).to(Git);
    bind<IGitArgsService>(TYPES.IGitArgsService).to(GitArgsService);
    bind<IGitServiceFactory>(TYPES.IGitServiceFactory).to(GitServiceFactory);
});
