// import * as vscode from 'vscode';
// import { LogEntry } from '../types';
// import { CommitEntryNode, FileStatNode, LogEntryNode, TextNode } from './logEntryNode';
// // import * as path from 'path';
// export class CommitProvider implements vscode.TreeDataProvider<CommitEntryNode> {

//     private _onDidChangeTreeData: vscode.EventEmitter<CommitEntryNode | undefined> = new vscode.EventEmitter<CommitEntryNode | undefined>();
//     private _logEntries: LogEntry[] = [];
//     public readonly onDidChangeTreeData: vscode.Event<CommitEntryNode | undefined> = this._onDidChangeTreeData.event;

//     public addLogEntry(logEntry: LogEntry) {
//         this._logEntries.push(logEntry);
//     }
//     public clear() {
//         this._logEntries = [];
//     }
//     public refresh(): void {
//         this._onDidChangeTreeData.fire();
//     }

//     public getTreeItem(element: CommitEntryNode): vscode.TreeItem {
//         return element;
//     }

//     public getChildren(element?: CommitEntryNode): Thenable<CommitEntryNode[]> {
//         if (this._logEntries.length === 0) {
//             return Promise.resolve([]);
//         }
//         if (!element) {
//             return Promise.all(this._logEntries.map(this.buildNodeForLogEntry));
//         }
//         if (element && element instanceof LogEntryNode) {
//             return Promise.all(this.buildChildNodesForLogEntry(element.logEntry));
//         }
//         // if (element && element instanceof DirectoryNode) {
//         //     return Promise.all(this.buildSubDirectories(element));
//         // }
//         return Promise.resolve([]);
//     }

//     private buildNodeForLogEntry(logEntry: LogEntry): LogEntryNode {
//         return new LogEntryNode(logEntry);
//     }
//     private buildChildNodesForLogEntry(logEntry: LogEntry): CommitEntryNode[] {
//         return [
//             new TextNode(`${logEntry.hash.short} - ${logEntry.subject}`),
//             ...this.buildChildDirectoriesForLogEntry(logEntry)
//         ];
//     }
//     private buildChildDirectoriesForLogEntry(logEntry: LogEntry): CommitEntryNode[] {
//         return (logEntry.committedFiles || [])
//             .map(fileStat => new FileStatNode(fileStat, logEntry))
//             .sort((a, b) => a.fileStat.uri.fsPath < b.fileStat.uri.fsPath ? -1 : 1);
//     }
// }
