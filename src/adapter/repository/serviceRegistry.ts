import { IServiceManager } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { GitServiceFactory } from './factory';
import { Git } from './git';
import { GitArgsService } from './gitArgsService';
import { IGitArgsService } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IGitService>(IGitService, Git);
    serviceManager.add<IGitArgsService>(IGitArgsService, GitArgsService);
    serviceManager.add<IGitServiceFactory>(IGitServiceFactory, GitServiceFactory);
}
