import { IServiceManager } from '../ioc/types';
import { FileSystem } from './fileSystem';
import { PlatformService } from './platformService';
import { IFileSystem, IPlatformService } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IPlatformService>(IPlatformService, PlatformService);
    serviceManager.add<IFileSystem>(IFileSystem, FileSystem);
}
