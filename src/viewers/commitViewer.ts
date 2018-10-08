import { inject, injectable } from 'inversify';
import * as path from 'path';
import { EventEmitter, TreeDataProvider, TreeItemCollapsibleState, window } from 'vscode';
import { Event, OutputChannel, TreeItem } from 'vscode';
import { ICommandManager } from '../application/types/commandManager';
import { CommitDetails, CompareCommitDetails } from '../common/types';
import { ICommitViewFormatter } from '../formatters/types';
import { DirectoryTreeItem } from '../nodes/treeNodes';
import { DirectoryNode, FileNode, INodeBuilder } from '../nodes/types';
import { IOutputChannel } from '../types';
import { ICommitViewer } from './types';

@injectable()
export class CommitViewer implements ICommitViewer, TreeDataProvider<DirectoryNode | FileNode> {
    private registered: boolean = false;
    private commit?: CommitDetails;
    private _onDidChangeTreeData = new EventEmitter<DirectoryNode | FileNode>();
    private fileView: boolean = false;
    public get onDidChangeTreeData(): Event<DirectoryNode | FileNode> {
        return this._onDidChangeTreeData.event;
    }
    public get selectedCommit(): Readonly<CommitDetails> {
        return this.commit!;
    }
    constructor(@inject(IOutputChannel) private outputChannel: OutputChannel,
        @inject(ICommitViewFormatter) private commitFormatter: ICommitViewFormatter,
        @inject(ICommandManager) private commandManager: ICommandManager,
        private nodeBuilder: INodeBuilder,
        private treeId: string, private visibilityContextVariable: string) {
    }
    public showCommitTree(commit: CommitDetails) {
        this.commit = commit;

        if (!this.registered) {
            this.registered = true;
            window.registerTreeDataProvider(this.treeId, this);
        }
        this._onDidChangeTreeData.fire();
        this.commandManager.executeCommand('setContext', this.visibilityContextVariable, true);
    }
    public showCommit(commit: CommitDetails): void {
        const output = this.commitFormatter.format(commit.logEntry);
        this.outputChannel.appendLine(output);
        this.outputChannel.show();
    }
    public showFilesView(): void {
        this.fileView = true;
        this._onDidChangeTreeData.fire();
    }
    public showFolderView(): void {
        this.fileView = false;
        this._onDidChangeTreeData.fire();
    }
    public async getTreeItem(element: DirectoryNode | FileNode): Promise<TreeItem> {
        const treeItem = await this.nodeBuilder.getTreeItem(element);
        if (treeItem instanceof DirectoryTreeItem) {
            treeItem.collapsibleState = TreeItemCollapsibleState.Expanded;
        }
        if (this.fileView) {
            const fileDirectory = path.dirname(element.resource.fsPath);
            const isEmptyPath = fileDirectory === path.sep;
            treeItem.label = `${element.label} ${isEmptyPath ? '' : '•'} ${isEmptyPath ? '' : fileDirectory}`.trim();
        }
        return treeItem;
    }
    public async getChildren(element?: DirectoryNode | FileNode | undefined): Promise<(DirectoryNode | FileNode)[]> {
        if (!element) {
            // tslint:disable-next-line:no-suspicious-comment
            // TODO: HACK
            const committedFiles = this.treeId === 'commitViewProvider' ? this.commit!.logEntry.committedFiles! : (this.commit as CompareCommitDetails).committedFiles;
            return this.fileView ? this.nodeBuilder.buildList(this.commit!, committedFiles) : this.nodeBuilder.buildTree(this.commit!, committedFiles);
        }
        if (element! instanceof DirectoryNode) {
            return (element as DirectoryNode).children;
        }
        return [];
    }
}
