export interface IStateStore {
    has(key: string): boolean;
    set<T>(key: string, data: T): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
}

export const IStateStoreFactory = Symbol('IStateStoreFactory');
export const GlobalStateStore = 'global';
export const WorkspaceStateStore = 'workspace';

export interface IStateStoreFactory {
    createStore(): IStateStore;
}
