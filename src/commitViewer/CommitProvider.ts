import * as vscode from 'vscode';
import { LogEntry } from '../contracts';
import { LogEntryNode, CommitEntryNode, TextNode, FileStatNode } from './logEntryNode';
// import * as path from 'path';
export class CommitProvider implements vscode.TreeDataProvider<CommitEntryNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<CommitEntryNode | undefined> = new vscode.EventEmitter<CommitEntryNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<CommitEntryNode | undefined> = this._onDidChangeTreeData.event;
    private _logEntries: LogEntry[] = [];
    constructor() {
    }

    addLogEntry(logEntry: LogEntry) {
        this._logEntries.push(logEntry);
    }
    clear() {
        this._logEntries = [];
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CommitEntryNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CommitEntryNode): Thenable<CommitEntryNode[]> {
        if (this._logEntries.length === 0) {
            return Promise.resolve([]);
        }
        if (!element) {
            return Promise.all(this._logEntries.map(this.buildNodeForLogEntry));
        }
        if (element && element instanceof LogEntryNode) {
            return Promise.all(this.buildChildNodesForLogEntry(element.logEntry));
        }
        // if (element && element instanceof DirectoryNode) {
        //     return Promise.all(this.buildSubDirectories(element));
        // }
        return Promise.resolve([]);
    }

    private buildNodeForLogEntry(logEntry: LogEntry): LogEntryNode {
        return new LogEntryNode(logEntry);
    }
    private buildChildNodesForLogEntry(logEntry: LogEntry): CommitEntryNode[] {
        return [
            new TextNode(`${logEntry.sha1.short} - ${logEntry.subject}`),
            ...this.buildChildDirectoriesForLogEntry(logEntry)
        ];
    }
    private buildChildDirectoriesForLogEntry(logEntry: LogEntry): CommitEntryNode[] {
        return logEntry.fileStats
            .map(fileStat => new FileStatNode(fileStat, logEntry))
            .sort((a, b) => a.fileStat.path < b.fileStat.path ? -1 : 1);
    }
}