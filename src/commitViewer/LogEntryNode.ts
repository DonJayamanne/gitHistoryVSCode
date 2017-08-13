import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { LogEntry, FileStat, Modification } from '../contracts';
import * as path from 'path';

export const GitCommitIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'git-commit.png'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'octicons', 'svg', 'git-commit.svg')
};
export const FolderIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'folder.svg'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'lightTheme', 'folder.svg')
};
export const AddedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-added.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-added.svg')
};
export const RemovedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-deleted.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-deleted.svg')
};
export const ModifiedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-modified.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-modified.svg')
};
export const FileIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'document.svg'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'lightTheme', 'document.svg')
};
export const RenameIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-renamed.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-renamed.svg')
};

export abstract class CommitEntryNode extends TreeItem {
    constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }
}
export class LogEntryNode extends CommitEntryNode {
    constructor(public logEntry: LogEntry) {
        super(`${logEntry.author.name} on ${logEntry.author.localisedDate}`, TreeItemCollapsibleState.Collapsed);
        this.iconPath = GitCommitIcon;
    }

    contextValue = 'logEntry';
}
export class TextNode extends CommitEntryNode {
    constructor(public label: string) {
        super(label, TreeItemCollapsibleState.None);
    }
}
export class DirectoryNode extends CommitEntryNode {
    constructor(public fullPath: string, public logEntry: LogEntry) {
        super(path.basename(fullPath), TreeItemCollapsibleState.Collapsed);

        const upperDirPath = fullPath.toUpperCase();
        this.fileStats = logEntry.fileStats.filter(fileStat => path.dirname(fileStat.path).toUpperCase() === upperDirPath);
        this.iconPath = FolderIcon;
    }

    public fileStats: FileStat[] = [];
    contextValue = 'directory';
}
export class FileStatNode extends CommitEntryNode {
    constructor(public fileStat: FileStat, public logEntry: LogEntry) {
        super(FileStatNode.getTitle(fileStat), TreeItemCollapsibleState.None);
        switch (fileStat.mode) {
            case Modification.Created: {
                this.contextValue = 'fileStatA';
                this.iconPath = AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [this]
                };
                break;
            }
            case Modification.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstPrevious',
                    arguments: [this]
                };
                break;
            }
            case Modification.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = RemovedIcon;
                break;
            }
            case Modification.Renamed: {
                this.contextValue = 'fileStatR';
                this.iconPath = RenameIcon;
                break;
            }
            default: {
                this.contextValue = 'fileStat';
                this.iconPath = FileIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [this]
                };
            }
        }

    }

    static getTitle(fileStat: FileStat): string {
        const fileName = path.basename(fileStat.path);
        return fileName === fileStat.path ? fileName : `${fileName} (${path.dirname(fileStat.path)})`;
    }
}