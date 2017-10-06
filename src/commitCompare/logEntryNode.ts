import { AddedIcon, FileStatNode, ModifiedIcon, RemovedIcon } from '../commitViewer/logEntryNode';
import { CommittedFile, LogEntry, Status } from '../types';

export class CompareFileStatNode extends FileStatNode {
    constructor(public fileStat: CommittedFile, leftLogEntry: LogEntry, public rightLogEntry: LogEntry) {
        super(fileStat, leftLogEntry);
        switch (fileStat.status) {
            case Status.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstCommit',
                    arguments: [this]
                };
                break;
            }
            case Status.Added: {
                this.contextValue = 'fileStatA';
                this.iconPath = AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new FileStatNode(fileStat, rightLogEntry)]
                };
                break;
            }
            case Status.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = RemovedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new FileStatNode(fileStat, leftLogEntry)]
                };
                break;
            }
            default: {
                // Do ntohing
            }
        }
    }
}
