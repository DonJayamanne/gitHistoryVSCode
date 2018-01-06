import { IServiceManager } from '../ioc/types';
import { GitFileHistoryCommandHandler } from './fileHistory';
import { GitBranchFromCommitCommandHandler } from './gitBranchFromCommit';
import { GitCherryPickCommandHandler } from './gitCherryPick';
import { GitCommitCommandHandler } from './gitCommit';
import { GitCompareCommandHandler } from './gitCompare';
import { GitHistoryCommandHandler } from './gitHistory';
import { CommandHandlerManager } from './handlerManager';
import { ICommandHandler, ICommandHandlerManager, ICommitCommandBuilder, IFileCommitCommandBuilder, IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitCommandHandler, IGitCompareCommandHandler, IGitFileHistoryCommandHandler, IGitHistoryCommandHandler } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IGitFileHistoryCommandHandler>(IGitFileHistoryCommandHandler, GitFileHistoryCommandHandler);
    serviceManager.addSingletonInstance<IFileCommitCommandBuilder>(IFileCommitCommandBuilder, serviceManager.get<IFileCommitCommandBuilder>(IGitFileHistoryCommandHandler));

    serviceManager.addSingleton<IGitBranchFromCommitCommandHandler>(IGitBranchFromCommitCommandHandler, GitBranchFromCommitCommandHandler);
    serviceManager.addSingletonInstance<ICommitCommandBuilder>(ICommitCommandBuilder, serviceManager.get<ICommitCommandBuilder>(IGitBranchFromCommitCommandHandler));

    serviceManager.addSingleton<IGitHistoryCommandHandler>(IGitHistoryCommandHandler, GitHistoryCommandHandler);

    serviceManager.addSingleton<IGitCommitCommandHandler>(IGitCommitCommandHandler, GitCommitCommandHandler);
    serviceManager.addSingletonInstance<ICommitCommandBuilder>(ICommitCommandBuilder, serviceManager.get<ICommitCommandBuilder>(IGitCommitCommandHandler));

    serviceManager.addSingleton<IGitCherryPickCommandHandler>(IGitCherryPickCommandHandler, GitCherryPickCommandHandler);
    serviceManager.addSingletonInstance<ICommitCommandBuilder>(ICommitCommandBuilder, serviceManager.get<ICommitCommandBuilder>(IGitCherryPickCommandHandler));

    serviceManager.addSingleton<IGitCompareCommandHandler>(IGitCompareCommandHandler, GitCompareCommandHandler);
    serviceManager.addSingletonInstance<ICommitCommandBuilder>(ICommitCommandBuilder, serviceManager.get<ICommitCommandBuilder>(IGitCompareCommandHandler));

    [IGitFileHistoryCommandHandler, IGitBranchFromCommitCommandHandler, IGitHistoryCommandHandler,
        IGitCommitCommandHandler, IGitCherryPickCommandHandler, IGitCompareCommandHandler].forEach(serviceIdentifier => {
            const instance = serviceManager.get<ICommandHandler>(serviceIdentifier);
            serviceManager.addSingletonInstance<ICommandHandler>(ICommandHandler, instance);
        });

    serviceManager.addSingleton<ICommandHandlerManager>(ICommandHandlerManager, CommandHandlerManager);

    const handlerManager = serviceManager.get<ICommandHandlerManager>(ICommandHandlerManager);
    handlerManager.registerHandlers();
}
