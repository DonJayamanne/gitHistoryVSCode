import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { BranchSelection } from '../common/types';
import { LogEntries, LogEntry } from '../types';
import { IStateStore, State } from './types';

@injectable()
export class StateStore implements IStateStore {
    private storesPerWorkspace = new Map<string, State>();
    public async initialize(workspaceFolder: string, branch: string, branchSelection: BranchSelection): Promise<void> {
        this.storesPerWorkspace.set(workspaceFolder, { branch, branchSelection });
    }

    public async updateEntries(workspaceFolder: string, entries: Promise<LogEntries>, pageIndex: number, pageSize: number, branch: string, searchText: string, file: Uri): Promise<void> {
        const state = this.storesPerWorkspace.get(workspaceFolder)!;
        state.branch = branch;
        state.entries = entries;
        state.pageIndex = pageIndex;
        state.pageSize = pageSize;
        state.searchText = searchText;
        state.file = file;
    }

    public async updateLastHashCommit(workspaceFolder: string, hash: string, commit: Promise<LogEntry>): Promise<void> {
        const state = this.storesPerWorkspace.get(workspaceFolder)!;
        state.lastFetchedHash = hash;
        state.lastFetchedCommit = commit;
    }

    public getState(workspaceFolder: string): Readonly<State> | undefined {
        return this.storesPerWorkspace.get(workspaceFolder);
    }

    public dispose() {
        this.storesPerWorkspace.clear();
    }
}
