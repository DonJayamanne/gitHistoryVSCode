import * as vscode from 'vscode';
import { LogEntry } from '../contracts';
import { CompareFileStatNode } from './logEntryNode';
// import * as path from 'path';
export class CommitCompareProvider implements vscode.TreeDataProvider<CompareFileStatNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<CompareFileStatNode | undefined> = new vscode.EventEmitter<CompareFileStatNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<CompareFileStatNode | undefined> = this._onDidChangeTreeData.event;
    private _leftEntry?: LogEntry;
    private _rightEntry?: LogEntry;
    constructor() {
    }

    public setComparisonEntries(leftEntry: LogEntry, rightEntry: LogEntry) {
        this._leftEntry = leftEntry;
        this._rightEntry = rightEntry;
    }
    clear() {
        this._leftEntry = undefined;
        this._rightEntry = undefined;
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CompareFileStatNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CompareFileStatNode): Thenable<CompareFileStatNode[]> {
        if (!this._leftEntry) {
            return Promise.resolve([]);
        }
        const entries = this._leftEntry.fileStats.map(entry => {
            return new CompareFileStatNode(entry, this._leftEntry!, this._rightEntry!);
        });
        return Promise.resolve(entries);
    }
}