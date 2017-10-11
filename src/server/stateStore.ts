import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { BranchSelection } from '../common/types';
import { LogEntries, LogEntry } from '../types';
import { IStateStore, State } from './types';

@injectable()
export class StateStore implements IStateStore {
    public initialize(workspaceFolder: string, branchName: string, branchSelection: BranchSelection): Promise<void> {
        throw new Error('Not implemented yet.');
    }

    public updateEntries(workspaceFolder: string, entries: Promise<LogEntries>, pageIndex: number, pageSize: number, branch: string, searchText: string, file: Uri): Promise<void> {
        throw new Error('Not implemented yet.');
    }

    public updateSelection(workspaceFolder: string, hash: string, commit: Promise<LogEntry>): Promise<void> {
        throw new Error('Not implemented yet.');
    }

    public getState(workspaceFolder: string): State {
        throw new Error('Not implemented yet.');
    }

    public dispose() {
        throw new Error('Not implemented yet.');
    }
}
