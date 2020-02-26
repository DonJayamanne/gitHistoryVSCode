import { IServiceManager } from '../ioc/types';
import { GitCommitViewExplorerCommandHandler } from './commit/commitViewExplorer';
import { GitCompareCommitCommandHandler } from './commit/compare';
import { GitCompareCommitViewExplorerCommandHandler } from './commit/compareViewExplorer';
import { GitCheckoutCommandHandler } from './commit/gitCheckout';
import { GitCherryPickCommandHandler } from './commit/gitCherryPick';
import { GitCommitCommandHandler } from './commit/gitCommit';
import { GitCommitViewDetailsCommandHandler } from './commit/gitCommitDetails';
import { GitMergeCommandHandler } from './commit/gitMerge';
import { GitRebaseCommandHandler } from './commit/gitRebase';
import { GitRevertCommandHandler } from './commit/revert';
import { FileCommandHandler } from './file/file';
import { GitCompareFileCommitCommandHandler } from './fileCommit/fileCompare';
import { GitFileHistoryCommandHandler } from './fileCommit/fileHistory';
import { GitHistoryCommandHandler } from './gitHistory';
import { CommandHandlerManager } from './handlerManager';
import { GitRefCommandHandler } from './ref/gitRef';
import { ICommandHandler, ICommandHandlerManager, IFileCommandHandler, IGitCheckoutCommandHandler, IGitCherryPickCommandHandler, IGitCommitCommandHandler, IGitCommitViewDetailsCommandHandler, IGitCommitViewExplorerCommandHandler, IGitCompareCommandHandler, IGitCompareCommitViewExplorerCommandHandler, IGitCompareFileCommandHandler, IGitFileHistoryCommandHandler, IGitHistoryCommandHandler, IGitMergeCommandHandler, IGitRebaseCommandHandler, IGitRefCommandHandler, IGitRevertCommandHandler } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IGitFileHistoryCommandHandler>(IGitFileHistoryCommandHandler, GitFileHistoryCommandHandler);
    serviceManager.addSingleton<IGitHistoryCommandHandler>(IGitHistoryCommandHandler, GitHistoryCommandHandler);
    serviceManager.addSingleton<IGitCommitCommandHandler>(IGitCommitCommandHandler, GitCommitCommandHandler);
    serviceManager.addSingleton<IGitRefCommandHandler>(IGitRefCommandHandler, GitRefCommandHandler);
    serviceManager.addSingleton<IGitCommitViewDetailsCommandHandler>(IGitCommitViewDetailsCommandHandler, GitCommitViewDetailsCommandHandler);
    serviceManager.addSingleton<IGitCherryPickCommandHandler>(IGitCherryPickCommandHandler, GitCherryPickCommandHandler);
    serviceManager.addSingleton<IGitCheckoutCommandHandler>(IGitCheckoutCommandHandler, GitCheckoutCommandHandler);
    serviceManager.addSingleton<IGitCompareFileCommandHandler>(IGitCompareFileCommandHandler, GitCompareFileCommitCommandHandler);
    serviceManager.addSingleton<IGitCommitViewExplorerCommandHandler>(IGitCommitViewExplorerCommandHandler, GitCommitViewExplorerCommandHandler);
    serviceManager.addSingleton<IGitCompareCommandHandler>(IGitCompareCommandHandler, GitCompareCommitCommandHandler);
    serviceManager.addSingleton<IGitCompareCommitViewExplorerCommandHandler>(IGitCompareCommitViewExplorerCommandHandler, GitCompareCommitViewExplorerCommandHandler);
    serviceManager.addSingleton<IFileCommandHandler>(IFileCommandHandler, FileCommandHandler);
    serviceManager.addSingleton<IGitMergeCommandHandler>(IGitMergeCommandHandler, GitMergeCommandHandler);
    serviceManager.addSingleton<IGitRebaseCommandHandler>(IGitRebaseCommandHandler, GitRebaseCommandHandler);
    serviceManager.addSingleton<IGitRevertCommandHandler>(IGitRevertCommandHandler, GitRevertCommandHandler);

    [IGitFileHistoryCommandHandler,  IGitHistoryCommandHandler,
        IGitCommitCommandHandler, IGitCherryPickCommandHandler, IGitCompareFileCommandHandler,
        IGitCommitViewExplorerCommandHandler, IGitCompareCommitViewExplorerCommandHandler,
        IFileCommandHandler, IGitMergeCommandHandler, IGitRebaseCommandHandler,
        IGitRevertCommandHandler].forEach(serviceIdentifier => {
            const instance = serviceManager.get<ICommandHandler>(serviceIdentifier);
            serviceManager.addSingletonInstance<ICommandHandler>(ICommandHandler, instance);
        });

    serviceManager.addSingleton<ICommandHandlerManager>(ICommandHandlerManager, CommandHandlerManager);

    const handlerManager = serviceManager.get<ICommandHandlerManager>(ICommandHandlerManager);
    handlerManager.registerHandlers();
}
