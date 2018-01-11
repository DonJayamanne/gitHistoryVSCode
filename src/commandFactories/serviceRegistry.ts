import { IServiceManager } from '../ioc/types';
import { CommitCommandFactory } from './commitFactory';
import { FileCommitCommandFactory } from './fileCommitFactory';
import { ICommitCommandFactory, IFileCommitCommandFactory } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IFileCommitCommandFactory>(IFileCommitCommandFactory, FileCommitCommandFactory);
    serviceManager.add<ICommitCommandFactory>(ICommitCommandFactory, CommitCommandFactory);
}
