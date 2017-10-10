import { ContainerModule, interfaces } from 'inversify';
import { IGitService, IGitServiceFactory } from '../../types';
import { GitServiceFactory } from './factory';
import { Git } from './git';
import { GitArgsService } from './gitArgsService';
import { IGitArgsService } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGitService>(IGitService).to(Git);
    bind<IGitArgsService>(IGitArgsService).to(GitArgsService);
    bind<IGitServiceFactory>(IGitServiceFactory).to(GitServiceFactory);
});
