import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { BranchSelection, LogEntries, LogEntry } from '../types';
import { IStateStore, State } from './types';

@injectable()
export class StateStore implements IStateStore {
    private storesPerWorkspace = new Map<string, State>();
    public async initialize(workspaceFolder: string, branch: string, branchSelection: BranchSelection): Promise<void> {
        this.storesPerWorkspace.set(workspaceFolder, { branch, branchSelection });
    }

    public async updateEntries(workspaceFolder: string, entries?: Promise<LogEntries>, pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: Uri, branchSelection?: BranchSelection): Promise<void> {
        const state = this.storesPerWorkspace.get(workspaceFolder) || {};
        state.branch = branch;
        state.entries = entries;
        state.pageIndex = pageIndex;
        state.pageSize = pageSize;
        state.searchText = searchText;
        state.file = file;
        state.branchSelection = branchSelection;
        this.storesPerWorkspace.set(workspaceFolder, state);
    }

    public async updateLastHashCommit(workspaceFolder: string, hash: string, commit: Promise<LogEntry>): Promise<void> {
        const state = this.storesPerWorkspace.get(workspaceFolder) || {};
        state.lastFetchedHash = hash;
        state.lastFetchedCommit = commit;
        this.storesPerWorkspace.set(workspaceFolder, state);
    }

    public async clearLastHashCommit(workspaceFolder: string): Promise<void> {
        const state = this.storesPerWorkspace.get(workspaceFolder) || {};
        state.lastFetchedHash = undefined;
        state.lastFetchedCommit = undefined;
        this.storesPerWorkspace.set(workspaceFolder, state);
    }

    public getState(workspaceFolder: string): Readonly<State> | undefined {
        return this.storesPerWorkspace.get(workspaceFolder);
    }

    public dispose() {
        this.storesPerWorkspace.clear();
    }
}
