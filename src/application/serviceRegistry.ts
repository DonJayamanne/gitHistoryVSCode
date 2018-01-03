import { IServiceManager } from '../ioc/types';
import { ApplicationShell } from './applicationShell';
import { CommandManager } from './commandManager';
import { IApplicationShell } from './types';
import { ICommandManager } from './types/commandManager';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IApplicationShell>(IApplicationShell, ApplicationShell);
    serviceManager.add<ICommandManager>(ICommandManager, CommandManager);
}
