import { IServiceManager } from '../ioc/types';
import { GitCommitViewExplorerCommandHandler } from './commit/commitViewExplorer';
import { GitCompareCommitCommandHandler } from './commit/compare';
import { GitCompareCommitViewExplorerCommandHandler } from './commit/compareViewExplorer';
import { GitBranchFromCommitCommandHandler } from './commit/gitBranchFromCommit';
import { GitCherryPickCommandHandler } from './commit/gitCherryPick';
import { GitCommitCommandHandler } from './commit/gitCommit';
import { GitCommitViewDetailsCommandHandler } from './commit/gitCommitDetails';
import { GitCompareFileCommitCommandHandler } from './fileCommit/fileCompare';
import { GitFileHistoryCommandHandler } from './fileCommit/fileHistory';
import { GitHistoryCommandHandler } from './gitHistory';
import { CommandHandlerManager } from './handlerManager';
import { ICommandHandler, ICommandHandlerManager, IGitBranchFromCommitCommandHandler, IGitCherryPickCommandHandler, IGitCommitCommandHandler, IGitCommitViewDetailsCommandHandler, IGitCommitViewExplorerCommandHandler, IGitCompareCommandHandler, IGitCompareCommitViewExplorerCommandHandler, IGitCompareFileCommandHandler, IGitFileHistoryCommandHandler, IGitHistoryCommandHandler } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IGitFileHistoryCommandHandler>(IGitFileHistoryCommandHandler, GitFileHistoryCommandHandler);
    serviceManager.addSingleton<IGitBranchFromCommitCommandHandler>(IGitBranchFromCommitCommandHandler, GitBranchFromCommitCommandHandler);
    serviceManager.addSingleton<IGitHistoryCommandHandler>(IGitHistoryCommandHandler, GitHistoryCommandHandler);
    serviceManager.addSingleton<IGitCommitCommandHandler>(IGitCommitCommandHandler, GitCommitCommandHandler);
    serviceManager.addSingleton<IGitCommitViewDetailsCommandHandler>(IGitCommitViewDetailsCommandHandler, GitCommitViewDetailsCommandHandler);
    serviceManager.addSingleton<IGitCherryPickCommandHandler>(IGitCherryPickCommandHandler, GitCherryPickCommandHandler);
    serviceManager.addSingleton<IGitCompareFileCommandHandler>(IGitCompareFileCommandHandler, GitCompareFileCommitCommandHandler);
    serviceManager.addSingleton<IGitCommitViewExplorerCommandHandler>(IGitCommitViewExplorerCommandHandler, GitCommitViewExplorerCommandHandler);
    serviceManager.addSingleton<IGitCompareCommandHandler>(IGitCompareCommandHandler, GitCompareCommitCommandHandler);
    serviceManager.addSingleton<IGitCompareCommitViewExplorerCommandHandler>(IGitCompareCommitViewExplorerCommandHandler, GitCompareCommitViewExplorerCommandHandler);

    [IGitFileHistoryCommandHandler, IGitBranchFromCommitCommandHandler, IGitHistoryCommandHandler,
        IGitCommitCommandHandler, IGitCherryPickCommandHandler, IGitCompareFileCommandHandler,
        IGitCommitViewExplorerCommandHandler, IGitCompareCommitViewExplorerCommandHandler].forEach(serviceIdentifier => {
            const instance = serviceManager.get<ICommandHandler>(serviceIdentifier);
            serviceManager.addSingletonInstance<ICommandHandler>(ICommandHandler, instance);
        });

    serviceManager.addSingleton<ICommandHandlerManager>(ICommandHandlerManager, CommandHandlerManager);

    const handlerManager = serviceManager.get<ICommandHandlerManager>(ICommandHandlerManager);
    handlerManager.registerHandlers();
}
