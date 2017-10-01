import { ContainerModule, interfaces } from 'inversify';
import { IGit } from '../types';
import { TYPES } from './constants';
import { Git } from './git';
import { GitArgsService } from './gitArgsService';
import { IGitArgsService } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGit>(TYPES.IGit).to(Git);
    bind<IGitArgsService>(TYPES.IGitArgsService).to(GitArgsService);
});
