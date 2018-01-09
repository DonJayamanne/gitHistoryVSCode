import { IServiceManager } from '../ioc/types';
import { NodeBuilder } from './nodeBuilder';
import { INodeBuilder } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<INodeBuilder>(INodeBuilder, NodeBuilder);
}
