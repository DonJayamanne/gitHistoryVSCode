import * as path from 'path';
import { Uri } from 'vscode';
import { CommitDetails, FileCommitDetails } from '../common/types';
import { CommittedFile } from '../types';
import { DirectoryTreeItem, FileTreeItem } from './treeNodes';

export interface INode<T> {
    /**
     * A human readable string which is rendered prominent.
     */
    readonly label: string;
    readonly resource: Uri;
    readonly data?: T;
    readonly children: INode<T>[];
}

export abstract class AbstractCommitNode<T> implements INode<T> {
    public children: AbstractCommitNode<T>[] = [];
    // @ts-ignore
    private _label: string;
    // @ts-ignore
    private _resource: Uri;
    public get label() {
        return this._label;
    }
    public get resource() {
        return this._resource;
    }
    constructor(public readonly data: T | undefined) {}
    protected setLabel(value: string) {
        this._label = value;
    }
    protected setResoruce(value: string | Uri) {
        this._resource = typeof value === 'string' ? Uri.file(value) : value;
    }
}

export class DirectoryNode extends AbstractCommitNode<CommitDetails | FileCommitDetails> {
    constructor(commit: CommitDetails, relativePath: string) {
        super(commit);
        const folderName = path.basename(relativePath);
        this.setLabel(folderName);
        this.setResoruce(relativePath);
    }
}

export class FileNode extends AbstractCommitNode<FileCommitDetails> {
    constructor(commit: FileCommitDetails) {
        super(commit);
        const fileName = path.basename(commit.committedFile.relativePath);
        this.setLabel(fileName);
        this.setResoruce(commit.committedFile.relativePath);
    }
}

export const INodeFactory = Symbol.for('INodeFactory');

export interface INodeFactory {
    createDirectoryNode(commit: CommitDetails, relativePath: string): DirectoryNode;
    createFileNode(commit: CommitDetails, committedFile: CommittedFile): FileNode;
}

export const INodeBuilder = Symbol.for('INodeBuilder');

export interface INodeBuilder {
    buildTree(commit: CommitDetails, committedFiles: CommittedFile[]): (DirectoryNode | FileNode)[];
    buildList(commit: CommitDetails, committedFiles: CommittedFile[]): FileNode[];
    getTreeItem(node: DirectoryNode | FileNode): Promise<DirectoryTreeItem | FileTreeItem>;
}
