import { IServiceManager } from '../ioc/types';
import { CommitViewerFactory } from './commitViewerFactory';
import {  ICommitViewerFactory } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ICommitViewerFactory>(ICommitViewerFactory, CommitViewerFactory);
}
