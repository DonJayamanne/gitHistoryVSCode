import { ContainerModule, interfaces } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { TYPES } from './constants';
import { GitCommandExecutor, IGitCommandExecutor } from './exec/index';
import { GitExecutableLocator, IGitExecutableLocator } from './locator';
import { Git } from './repository/git';
import { IGit } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGit>(TYPES.IGit).to(Git);
    bind<IGitExecutableLocator>(TYPES.IGitExecutableLocator).to(GitExecutableLocator);
    bind<IGitCommandExecutor>(TYPES.IGitCommandExecutor).to(GitCommandExecutor);
});
