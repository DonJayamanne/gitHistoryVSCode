// tslint:disable:no-redundant-jsdoc

import { CancellationToken, ConfigurationChangeEvent, Event, FileSystemWatcher, GlobPattern, Uri, WorkspaceConfiguration, WorkspaceFolder, WorkspaceFoldersChangeEvent } from 'vscode';

export const IWorkspaceService = Symbol('IWorkspace');

export interface IWorkspaceService {
    /**
     * ~~The folder that is open in the editor. `undefined` when no folder
     * has been opened.~~
     *
     * @deprecated Use [`workspaceFolders`](#workspace.workspaceFolders) instead.
     *
     * @readonly
     */
    readonly rootPath: string | undefined;

    /**
     * List of workspace folders or `undefined` when no folder is open.
     * *Note* that the first entry corresponds to the value of `rootPath`.
     *
     * @readonly
     */
    readonly workspaceFolders: WorkspaceFolder[] | undefined;

    /**
     * An event that is emitted when a workspace folder is added or removed.
     */
    readonly onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;

    /**
     * An event that is emitted when the [configuration](#WorkspaceConfiguration) changed.
     */
    readonly onDidChangeConfiguration: Event<ConfigurationChangeEvent>;

    /**
     * Returns the [workspace folder](#WorkspaceFolder) that contains a given uri.
     * * returns `undefined` when the given uri doesn't match any workspace folder
     * * returns the *input* when the given uri is a workspace folder itself
     *
     * @param uri An uri.
     * @return A workspace folder or `undefined`
     */
    getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined;

    /**
     * Returns a path that is relative to the workspace folder or folders.
     *
     * When there are no [workspace folders](#workspace.workspaceFolders) or when the path
     * is not contained in them, the input is returned.
     *
     * @param pathOrUri A path or uri. When a uri is given its [fsPath](#Uri.fsPath) is used.
     * @param includeWorkspaceFolder When `true` and when the given path is contained inside a
     * workspace folder the name of the workspace is prepended. Defaults to `true` when there are
     * multiple workspace folders and `false` otherwise.
     * @return A path relative to the root or the input.
     */
    asRelativePath(pathOrUri: string | Uri, includeWorkspaceFolder?: boolean): string;

    /**
     * Creates a file system watcher.
     *
     * A glob pattern that filters the file events on their absolute path must be provided. Optionally,
     * flags to ignore certain kinds of events can be provided. To stop listening to events the watcher must be disposed.
     *
     * *Note* that only files within the current [workspace folders](#workspace.workspaceFolders) can be watched.
     *
     * @param globPattern A [glob pattern](#GlobPattern) that is applied to the absolute paths of created, changed,
     * and deleted files. Use a [relative pattern](#RelativePattern) to limit events to a certain [workspace folder](#WorkspaceFolder).
     * @param ignoreCreateEvents Ignore when files have been created.
     * @param ignoreChangeEvents Ignore when files have been changed.
     * @param ignoreDeleteEvents Ignore when files have been deleted.
     * @return A new file system watcher instance.
     */
    createFileSystemWatcher(globPattern: GlobPattern, ignoreCreateEvents?: boolean, ignoreChangeEvents?: boolean, ignoreDeleteEvents?: boolean): FileSystemWatcher;

    /**
     * Find files across all [workspace folders](#workspace.workspaceFolders) in the workspace.
     *
     * @sample `findFiles('**∕*.js', '**∕node_modules∕**', 10)`
     * @param include A [glob pattern](#GlobPattern) that defines the files to search for. The glob pattern
     * will be matched against the file paths of resulting matches relative to their workspace. Use a [relative pattern](#RelativePattern)
     * to restrict the search results to a [workspace folder](#WorkspaceFolder).
     * @param exclude  A [glob pattern](#GlobPattern) that defines files and folders to exclude. The glob pattern
     * will be matched against the file paths of resulting matches relative to their workspace.
     * @param maxResults An upper-bound for the result.
     * @param token A token that can be used to signal cancellation to the underlying search engine.
     * @return A thenable that resolves to an array of resource identifiers. Will return no results if no
     * [workspace folders](#workspace.workspaceFolders) are opened.
     */
    findFiles(include: GlobPattern, exclude?: GlobPattern, maxResults?: number, token?: CancellationToken): Thenable<Uri[]>;

    /**
     * Get a workspace configuration object.
     *
     * When a section-identifier is provided only that part of the configuration
     * is returned. Dots in the section-identifier are interpreted as child-access,
     * like `{ myExt: { setting: { doIt: true }}}` and `getConfiguration('myExt.setting').get('doIt') === true`.
     *
     * When a resource is provided, configuration scoped to that resource is returned.
     *
     * @param section A dot-separated identifier.
     * @param resource A resource for which the configuration is asked for
     * @return The full configuration or a subset.
     */
    getConfiguration(section?: string, resource?: Uri): WorkspaceConfiguration;
}
