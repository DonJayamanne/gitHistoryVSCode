// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { IServiceManager } from '../ioc/types';
import { GitCommandExecutor, IGitCommandExecutor } from './exec/index';
import { GitExecutableLocator, IGitExecutableLocator } from './locator';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IGitExecutableLocator>(IGitExecutableLocator, GitExecutableLocator);
    serviceManager.add<IGitCommandExecutor>(IGitCommandExecutor, GitCommandExecutor);
}
