import { inject, injectable } from 'inversify';
import { Memento } from 'vscode';
import { IServiceContainer } from '../ioc/types';
import { IStateStore, IStateStoreFactory } from './types/stateStore';

@injectable()
export class WorkspaceStateStoreFactory implements IStateStoreFactory {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public createStore(): IStateStore {
        return new WorkspaceMementoStore(this.serviceContainer.get<Memento>('workspaceMementoStore'));
    }
}

@injectable()
export class GlobalStateStoreFactory implements IStateStoreFactory {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public createStore(): IStateStore {
        return new WorkspaceMementoStore(this.serviceContainer.get<Memento>('globalMementoStore'));
    }
}

export class WorkspaceMementoStore implements IStateStore {
    constructor(private store: Memento) { }
    public has(key: string): boolean {
        return this.store.get(key) !== undefined;
    }
    public async set<T>(key: string, data: T): Promise<void> {
        await this.store.update(key, data);
    }
    public async get<T>(key: string): Promise<T | undefined> {
        return this.store.get(key);
    }
}
