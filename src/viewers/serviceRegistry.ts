import { IServiceManager } from '../ioc/types';
import { CommitViewer } from './commitViewer';
import { ICommitViewer } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ICommitViewer>(ICommitViewer, CommitViewer);
}
