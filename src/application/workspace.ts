// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { CancellationToken, ConfigurationChangeEvent, Event, FileSystemWatcher, GlobPattern, Uri, workspace, WorkspaceConfiguration, WorkspaceFolder, WorkspaceFoldersChangeEvent } from 'vscode';
import { IWorkspaceService } from './types/workspace';

@injectable()
export class WorkspaceService implements IWorkspaceService {
    public get onDidChangeConfiguration(): Event<ConfigurationChangeEvent> {
        return workspace.onDidChangeConfiguration;
    }
    public get workspaceFolders(): WorkspaceFolder[] | undefined {
        return workspace.workspaceFolders;
    }
    public get onDidChangeWorkspaceFolders(): Event<WorkspaceFoldersChangeEvent> {
        return workspace.onDidChangeWorkspaceFolders;
    }
    public getConfiguration(section?: string, resource?: Uri): WorkspaceConfiguration {
        return workspace.getConfiguration(section, resource);
    }
    public asRelativePath(pathOrUri: string | Uri, includeWorkspaceFolder?: boolean): string {
        return workspace.asRelativePath(pathOrUri, includeWorkspaceFolder);
    }
    public createFileSystemWatcher(globPattern: GlobPattern, ignoreCreateEvents?: boolean, ignoreChangeEvents?: boolean, ignoreDeleteEvents?: boolean): FileSystemWatcher {
        return workspace.createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
    }
    public findFiles(include: GlobPattern, exclude?: GlobPattern, maxResults?: number, token?: CancellationToken): Thenable<Uri[]> {
        return workspace.findFiles(include, exclude, maxResults, token);
    }
}
