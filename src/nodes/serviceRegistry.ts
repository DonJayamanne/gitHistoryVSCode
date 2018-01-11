import { IServiceManager } from '../ioc/types';
import { ComparisonNodeFactory, StandardNodeFactory } from './factory';
import { INodeFactory } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<INodeFactory>(INodeFactory, StandardNodeFactory, 'standard');
    serviceManager.addSingleton<INodeFactory>(INodeFactory, ComparisonNodeFactory, 'comparison');
}
