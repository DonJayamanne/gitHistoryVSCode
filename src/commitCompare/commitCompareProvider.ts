import * as vscode from 'vscode';
import { LogEntry } from '../types';
import { CompareFileStatNode } from './logEntryNode';
// import * as path from 'path';
export class CommitCompareProvider implements vscode.TreeDataProvider<CompareFileStatNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<CompareFileStatNode | undefined> = new vscode.EventEmitter<CompareFileStatNode | undefined>();
    private _leftEntry?: LogEntry;
    private _rightEntry?: LogEntry;
    public readonly onDidChangeTreeData: vscode.Event<CompareFileStatNode | undefined> = this._onDidChangeTreeData.event;

    public setComparisonEntries(leftEntry: LogEntry, rightEntry: LogEntry) {
        this._leftEntry = leftEntry;
        this._rightEntry = rightEntry;
    }
    public clear() {
        this._leftEntry = undefined;
        this._rightEntry = undefined;
    }
    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: CompareFileStatNode): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: CompareFileStatNode): Thenable<CompareFileStatNode[]> {
        if (!this._leftEntry) {
            return Promise.resolve([]);
        }
        const entries = this._leftEntry.committedFiles!.map(entry => {
            return new CompareFileStatNode(entry, this._leftEntry!, this._rightEntry!);
        });
        return Promise.resolve(entries);
    }
}
