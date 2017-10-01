import { ContainerModule, interfaces } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { TYPES } from './constants';
import { GitCommandExecutor, IGitCommandExecutor } from './exec/index';
import { GitExecutableLocator, IGitExecutableLocator } from './locator';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGitExecutableLocator>(TYPES.IGitExecutableLocator).to(GitExecutableLocator);
    bind<IGitCommandExecutor>(TYPES.IGitCommandExecutor).to(GitCommandExecutor);
});
