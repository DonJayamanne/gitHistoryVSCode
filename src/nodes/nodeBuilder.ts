import { inject, injectable } from 'inversify';
import * as path from 'path';
import { IFileCommitCommandFactory } from '../commandFactories/types';
import { CommitDetails } from '../common/types';
import { IPlatformService } from '../platform/types';
import { CommittedFile, Status } from '../types';
import { AddedIcon, FileIcon, FolderIcon, ModifiedIcon, RemovedIcon } from './nodeIcons';
import { DirectoryTreeItem, FileTreeItem } from './treeNodes';
import { DirectoryNode, FileNode, INodeBuilder, INodeFactory } from './types';

@injectable()
export class NodeBuilder implements INodeBuilder {
    constructor(
        @inject(IFileCommitCommandFactory) private fileCommandFactory: IFileCommitCommandFactory,
        private nodeFactory: INodeFactory,
        @inject(IPlatformService) private platform: IPlatformService,
    ) {}
    public buildTree(commit: CommitDetails, committedFiles: CommittedFile[]): (DirectoryNode | FileNode)[] {
        const sortedFiles = committedFiles.sort((a, b) =>
            a.uri.fsPath.toUpperCase() > b.uri.fsPath.toUpperCase() ? 1 : -1,
        );
        const commitFileDetails = new Map<string, CommittedFile>();
        sortedFiles.forEach(item => commitFileDetails.set(item.uri.fsPath, item));

        const nodes = new Map<string, DirectoryNode | FileNode>();
        const roots: (DirectoryNode | FileNode)[] = [];

        sortedFiles.forEach(file => {
            const dirName = path.dirname(file.relativePath);
            const dirNode = dirName.split(path.sep).reduce<DirectoryNode | undefined>((parent, folderName, index) => {
                if (folderName === '.' && index === 0) {
                    return undefined;
                }
                const currentPath = parent ? path.join(parent.resource.fsPath, folderName) : folderName;
                const nodeExists = nodes.has(currentPath);
                if (nodes.has(currentPath)) {
                    return nodes.get(currentPath)!;
                }

                const folderNode = this.nodeFactory.createDirectoryNode(commit, currentPath);
                nodes.set(currentPath, folderNode);
                if (parent) {
                    parent.children.push(folderNode);
                }
                if (index === 0 && !nodeExists) {
                    roots.push(folderNode);
                }

                return folderNode;
            }, undefined as any);
            const fileNode = this.nodeFactory.createFileNode(commit, file);
            if (dirNode) {
                dirNode.children.push(fileNode);
            } else {
                roots.push(fileNode);
            }
        });

        nodes.forEach(node => (node.children = this.sortNodes(node.children)));

        return this.sortNodes(roots);
    }
    public buildList(commit: CommitDetails, committedFiles: CommittedFile[]): FileNode[] {
        const nodes = committedFiles.map(file => this.nodeFactory.createFileNode(commit, file));

        return this.sortFileNodes(nodes);
    }
    public async getTreeItem(element: DirectoryNode | FileNode): Promise<DirectoryTreeItem | FileTreeItem> {
        if (element instanceof DirectoryNode) {
            return this.buildDirectoryTreeItem(element);
        } else {
            return this.buildFileTreeItem(element);
        }
    }
    public buildDirectoryTreeItem(element: DirectoryNode): DirectoryTreeItem {
        const treeItem = new DirectoryTreeItem(element);
        treeItem.iconPath = FolderIcon;
        treeItem.contextValue = 'folder';
        if (treeItem.command) {
            treeItem.command.tooltip = 'sdafasfef.';
        }

        return treeItem;
    }
    public async buildFileTreeItem(element: FileNode): Promise<FileTreeItem> {
        const treeItem = new FileTreeItem(element);
        switch (element.data!.committedFile.status) {
            case Status.Added: {
                treeItem.iconPath = AddedIcon;
                break;
            }
            case Status.Modified: {
                treeItem.iconPath = ModifiedIcon;
                break;
            }
            case Status.Deleted: {
                treeItem.iconPath = RemovedIcon;
                break;
            }
            case Status.Renamed: {
                treeItem.iconPath = RemovedIcon;
                break;
            }
            default: {
                treeItem.iconPath = FileIcon;
            }
        }
        treeItem.contextValue = 'file';
        treeItem.command = await this.fileCommandFactory.getDefaultFileCommand(element.data!);

        return treeItem;
    }
    private sortNodes(nodes: (DirectoryNode | FileNode)[]): (DirectoryNode | FileNode)[] {
        let directoryNodes = nodes.filter(node => node instanceof DirectoryNode).map(node => node as DirectoryNode);
        let fileNodes = nodes.filter(node => node instanceof FileNode).map(node => node as FileNode);

        if (this.platform.isWindows) {
            directoryNodes = directoryNodes.sort((a, b) => (a.label.toUpperCase() > b.label.toUpperCase() ? 1 : -1));
            fileNodes = fileNodes.sort((a, b) => (a.label.toUpperCase() > b.label.toUpperCase() ? 1 : -1));
        } else {
            directoryNodes = directoryNodes.sort((a, b) => (a.label > b.label ? 1 : -1));
            fileNodes = fileNodes.sort((a, b) => (a.label > b.label ? 1 : -1));
        }

        return this.sortDirectoryNodes(directoryNodes).concat(this.sortFileNodes(fileNodes));
    }
    private sortDirectoryNodes(nodes: DirectoryNode[]): DirectoryNode[] {
        const directoryNodes = nodes.filter(node => node instanceof DirectoryNode).map(node => node);

        if (this.platform.isWindows) {
            return directoryNodes.sort((a, b) => (a.label.toUpperCase() > b.label.toUpperCase() ? 1 : -1));
        } else {
            return directoryNodes.sort((a, b) => (a.label > b.label ? 1 : -1));
        }
    }
    private sortFileNodes(nodes: FileNode[]): FileNode[] {
        const fileNodes = nodes.filter(node => node instanceof FileNode).map(node => node);

        if (this.platform.isWindows) {
            return fileNodes.sort((a, b) => (a.label.toUpperCase() > b.label.toUpperCase() ? 1 : -1));
        } else {
            return fileNodes.sort((a, b) => (a.label > b.label ? 1 : -1));
        }
    }
}
