import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { formatDate } from '../common/helpers';
import { CommittedFile, LogEntry, Status } from '../types';

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
        super(`${logEntry.author!.name} on ${formatDate(logEntry.author!.date)}`, TreeItemCollapsibleState.Collapsed);
        this.iconPath = GitCommitIcon;
    }

    public contextValue = 'logEntry';
}
export class TextNode extends CommitEntryNode {
    constructor(public label: string) {
        super(label, TreeItemCollapsibleState.None);
    }
}
// tslint:disable-next-line:max-classes-per-file
export class DirectoryNode extends CommitEntryNode {
    constructor(public fullPath: string, public logEntry: LogEntry) {
        super(path.basename(fullPath), TreeItemCollapsibleState.Collapsed);

        const upperDirPath = fullPath.toUpperCase();
        this.fileStats = (logEntry.committedFiles || []).filter(fileStat => path.dirname(fileStat.uri.fsPath).toUpperCase() === upperDirPath);
        this.iconPath = FolderIcon;
    }

    public fileStats: CommittedFile[] = [];
    public contextValue = 'directory';
}
// tslint:disable-next-line:max-classes-per-file
export class FileStatNode extends CommitEntryNode {
    constructor(public fileStat: CommittedFile, public logEntry: LogEntry) {
        super(getTitle(fileStat), TreeItemCollapsibleState.None);
        switch (fileStat.status) {
            case Status.Added: {
                this.contextValue = 'fileStatA';
                this.iconPath = AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [this]
                };
                break;
            }
            case Status.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstPrevious',
                    arguments: [this]
                };
                break;
            }
            case Status.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = RemovedIcon;
                break;
            }
            case Status.Renamed: {
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

    // public static getTitle(fileStat: FileStat): string {
    //     const fileName = path.basename(fileStat.path);
    //     return fileName === fileStat.path ? fileName : `${fileName} (${path.dirname(fileStat.path)})`;
    // }
}

function getTitle(fileStat: CommittedFile): string {
    const fileName = path.basename(fileStat.uri.fsPath);
    return fileName === fileStat.uri.fsPath ? fileName : `${fileName} (${path.dirname(fileStat.uri.fsPath)})`;
}
