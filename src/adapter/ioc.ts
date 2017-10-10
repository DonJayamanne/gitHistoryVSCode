import { ContainerModule, interfaces } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { GitCommandExecutor, IGitCommandExecutor } from './exec/index';
import { GitExecutableLocator, IGitExecutableLocator } from './locator';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IGitExecutableLocator>(IGitExecutableLocator).to(GitExecutableLocator);
    bind<IGitCommandExecutor>(IGitCommandExecutor).to(GitCommandExecutor);
});
