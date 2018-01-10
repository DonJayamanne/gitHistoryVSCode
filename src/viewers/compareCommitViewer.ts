// import { inject, injectable } from 'inversify';
// import { Event, OutputChannel, TreeItem } from 'vscode';
// import { Disposable, EventEmitter, TreeDataProvider, TreeItemCollapsibleState, window } from 'vscode';
// import { ICommandManager } from '../application/types/commandManager';
// import { command } from '../commandHandlers/registration';
// import { CommitDetails } from '../common/types';
// import { ICommitViewFormatter } from '../formatters/types';
// import { DirectoryTreeItem } from '../nodes/treeNodes';
// import { DirectoryNode, FileNode, INodeBuilder } from '../nodes/types';
// import { IOutputChannel } from '../types';
// import { ICommitViewer, ICompareCommitViewer } from './types';

// @injectable()
// export class CommitViewer implements ICompareCommitViewer, TreeDataProvider<DirectoryNode | FileNode> {
//     private registered: boolean;
//     private commit: CommitDetails;
//     private _onDidChangeTreeData = new EventEmitter<DirectoryNode | FileNode>();
//     private _dataChangeHandler: Disposable;
//     private fileView: boolean;
//     public get onDidChangeTreeData(): Event<DirectoryNode | FileNode> {
//         return this._onDidChangeTreeData.event;
//     }
//     public get selectedCommit(): Readonly<CommitDetails> {
//         return this.commit;
//     }
//     constructor( @inject(IOutputChannel) private outputChannel: OutputChannel,
//         @inject(ICommitViewFormatter) private commitFormatter: ICommitViewFormatter,
//         @inject(ICommandManager) private commandManager: ICommandManager,
//         @inject(INodeBuilder) private nodeBuilder: INodeBuilder) {

//     }
//     public showCommitTree(commit: CommitDetails) {
//         this.commit = commit;
//         if (this._dataChangeHandler) {
//             this._dataChangeHandler.dispose();
//         }
//         if (!this.registered) {
//             this.registered = true;
//             window.registerTreeDataProvider('commitViewProvider', this);
//         }
//         this._onDidChangeTreeData.fire();
//         this.commandManager.executeCommand('setContext', 'git.commitView.show', true);
//     }
//     public showCommit(commit: CommitDetails): void {
//         const output = this.commitFormatter.format(commit.logEntry);
//         this.outputChannel.appendLine(output);
//         this.outputChannel.show();
//     }
//     public showFilesView(): void {
//         this.fileView = true;
//         this._onDidChangeTreeData.fire();
//     }
//     public showFolderView(): void {
//         this.fileView = false;
//         this._onDidChangeTreeData.fire();
//     }
//     public async getTreeItem(element: DirectoryNode | FileNode): Promise<TreeItem> {
//         const treeItem = await this.nodeBuilder.getTreeItem(element);
//         if (treeItem instanceof DirectoryTreeItem) {
//             treeItem.collapsibleState = TreeItemCollapsibleState.Expanded;
//         }
//         return treeItem;
//     }
//     public async getChildren(element?: DirectoryNode | FileNode | undefined): Promise<(DirectoryNode | FileNode)[]> {
//         if (!element) {
//             return this.fileView ? this.nodeBuilder.buildList(this.commit) : this.nodeBuilder.buildTree(this.commit);
//         }
//         if (element! instanceof DirectoryNode) {
//             return (element as DirectoryNode).children;
//         }
//         return [];
//     }
//     @command('git.commit.selected', ICommitViewer)
//     public onCommitSelected(commit: CommitDetails) {
//         this.showCommit(commit);
//         this.showCommitTree(commit);
//     }
// }