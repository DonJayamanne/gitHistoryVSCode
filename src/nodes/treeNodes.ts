import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { DirectoryNode, FileNode } from '../nodes/types';

export class DirectoryTreeItem extends TreeItem {
    constructor(public readonly data: DirectoryNode) {
        super(data.label, TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'folder';
    }
}

export class FileTreeItem extends TreeItem {
    constructor(public readonly data: FileNode) {
        super(data.label, TreeItemCollapsibleState.None);
    }
}
