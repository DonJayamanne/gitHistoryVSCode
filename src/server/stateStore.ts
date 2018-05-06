import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { BranchSelection, LogEntries, LogEntry } from '../types';
import { IWorkspaceQueryStateStore, State } from './types';

@injectable()
export class StateStore implements IWorkspaceQueryStateStore {
    private storesPerWorkspace = new Map<string, State>();
    public async initialize(id: string, workspaceFolder: string, gitRoot: string, branch: string, branchSelection: BranchSelection, searchText?: string, file?: Uri, lineNumber?: number, author?: string): Promise<void> {
        this.storesPerWorkspace.set(id, { gitRoot: gitRoot, branch, branchSelection, workspaceFolder, searchText, file, lineNumber, author });
    }

    public async updateEntries(id: string, entries?: Promise<LogEntries>, pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: Uri, branchSelection?: BranchSelection, lineNumber?: number, author?: string): Promise<void> {
        const state = this.storesPerWorkspace.get(id)!;
        state.branch = branch;
        state.entries = entries;
        state.author = author;
        state.pageIndex = pageIndex;
        state.lineNumber = lineNumber;
        state.pageSize = pageSize;
        state.searchText = searchText;
        state.file = file;
        state.branchSelection = branchSelection;
        this.storesPerWorkspace.set(id, state);
    }

    public async updateLastHashCommit(id: string, hash: string, commit: Promise<LogEntry>): Promise<void> {
        const state = this.storesPerWorkspace.get(id)!;
        state.lastFetchedHash = hash;
        state.lastFetchedCommit = commit;
        this.storesPerWorkspace.set(id, state);
    }

    public async clearLastHashCommit(id: string): Promise<void> {
        const state = this.storesPerWorkspace.get(id)!;
        state.lastFetchedHash = undefined;
        state.lastFetchedCommit = undefined;
        this.storesPerWorkspace.set(id, state);
    }

    public getState(id: string): Readonly<State> | undefined {
        return this.storesPerWorkspace.get(id);
    }

    public dispose() {
        this.storesPerWorkspace.clear();
    }
}
