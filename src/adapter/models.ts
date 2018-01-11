// tslint:disable-next-line:no-useless-files
// /*---------------------------------------------------------------------------------------------
//  *  Copyright (c) Microsoft Corporation. All rights reserved.
//  *  Licensed under the MIT License. See License.txt in the project root for license information.
//  *--------------------------------------------------------------------------------------------*/

// 'use strict';

// import { Uri, Command, Event, SourceControlResourceState, SourceControlResourceDecorations, Disposable, ProgressLocation, window, workspace, WorkspaceEdit } from 'vscode';
// import { Branch, Ref, Remote } from './git';
// import * as path from 'path';
// import * as fs from 'fs';

// const timeout = (millis: number) => new Promise(c => setTimeout(c, millis));

// const iconsRootPath = path.join(path.dirname(__dirname), '..', '..', '..', 'resources', 'icons');

// function getIconUri(iconName: string, theme: string): Uri {
//     return Uri.file(path.join(iconsRootPath, theme, `${iconName}.svg`));
// }

// export enum State {
//     Uninitialized,
//     Idle,
//     NotAGitRepository
// }

// export enum Status {
//     INDEX_MODIFIED,
//     INDEX_ADDED,
//     INDEX_DELETED,
//     INDEX_RENAMED,
//     INDEX_COPIED,

//     MODIFIED,
//     DELETED,
//     UNTRACKED,
//     IGNORED,

//     ADDED_BY_US,
//     ADDED_BY_THEM,
//     DELETED_BY_US,
//     DELETED_BY_THEM,
//     BOTH_ADDED,
//     BOTH_DELETED,
//     BOTH_MODIFIED
// }

// export class Resource implements SourceControlResourceState {

//     constructor(
//         private workspaceRoot: Uri,
//         private _resourceGroup: ResourceGroup,
//         private _resourceUri: Uri,
//         private _type: Status,
//         private _renameResourceUri?: Uri
//     ) { }

//     get resourceUri(): Uri {
//         if (this.renameResourceUri && (this._type === Status.MODIFIED || this._type === Status.DELETED || this._type === Status.INDEX_RENAMED || this._type === Status.INDEX_COPIED)) {
//             return this.renameResourceUri;
//         }

//         return this._resourceUri;
//     }

//     get command(): Command {
//         return {
//             command: 'git.openResource',
//             title: 'Open',
//             arguments: [this]
//         };
//     }

//     get resourceGroup(): ResourceGroup { return this._resourceGroup; }
//     get type(): Status { return this._type; }
//     get original(): Uri { return this._resourceUri; }
//     get renameResourceUri(): Uri | undefined { return this._renameResourceUri; }

//     private static Icons = {
//         light: {
//             Modified: getIconUri('status-modified', 'light'),
//             Added: getIconUri('status-added', 'light'),
//             Deleted: getIconUri('status-deleted', 'light'),
//             Renamed: getIconUri('status-renamed', 'light'),
//             Copied: getIconUri('status-copied', 'light'),
//             Untracked: getIconUri('status-untracked', 'light'),
//             Ignored: getIconUri('status-ignored', 'light'),
//             Conflict: getIconUri('status-conflict', 'light'),
//         },
//         dark: {
//             Modified: getIconUri('status-modified', 'dark'),
//             Added: getIconUri('status-added', 'dark'),
//             Deleted: getIconUri('status-deleted', 'dark'),
//             Renamed: getIconUri('status-renamed', 'dark'),
//             Copied: getIconUri('status-copied', 'dark'),
//             Untracked: getIconUri('status-untracked', 'dark'),
//             Ignored: getIconUri('status-ignored', 'dark'),
//             Conflict: getIconUri('status-conflict', 'dark')
//         }
//     };

//     private getIconPath(theme: string): Uri | undefined {
//         switch (this.type) {
//             case Status.INDEX_MODIFIED: return Resource.Icons[theme].Modified;
//             case Status.MODIFIED: return Resource.Icons[theme].Modified;
//             case Status.INDEX_ADDED: return Resource.Icons[theme].Added;
//             case Status.INDEX_DELETED: return Resource.Icons[theme].Deleted;
//             case Status.DELETED: return Resource.Icons[theme].Deleted;
//             case Status.INDEX_RENAMED: return Resource.Icons[theme].Renamed;
//             case Status.INDEX_COPIED: return Resource.Icons[theme].Copied;
//             case Status.UNTRACKED: return Resource.Icons[theme].Untracked;
//             case Status.IGNORED: return Resource.Icons[theme].Ignored;
//             case Status.BOTH_DELETED: return Resource.Icons[theme].Conflict;
//             case Status.ADDED_BY_US: return Resource.Icons[theme].Conflict;
//             case Status.DELETED_BY_THEM: return Resource.Icons[theme].Conflict;
//             case Status.ADDED_BY_THEM: return Resource.Icons[theme].Conflict;
//             case Status.DELETED_BY_US: return Resource.Icons[theme].Conflict;
//             case Status.BOTH_ADDED: return Resource.Icons[theme].Conflict;
//             case Status.BOTH_MODIFIED: return Resource.Icons[theme].Conflict;
//             default: return void 0;
//         }
//     }

//     private get strikeThrough(): boolean {
//         switch (this.type) {
//             case Status.DELETED:
//             case Status.BOTH_DELETED:
//             case Status.DELETED_BY_THEM:
//             case Status.DELETED_BY_US:
//             case Status.INDEX_DELETED:
//                 return true;
//             default:
//                 return false;
//         }
//     }

//     private get faded(): boolean {
//         const workspaceRootPath = this.workspaceRoot.fsPath;
//         return this.resourceUri.fsPath.substr(0, workspaceRootPath.length) !== workspaceRootPath;
//     }

//     get decorations(): SourceControlResourceDecorations {
//         const light = { iconPath: this.getIconPath('light') };
//         const dark = { iconPath: this.getIconPath('dark') };
//         const strikeThrough = this.strikeThrough;
//         const faded = this.faded;

//         return { strikeThrough, faded, light, dark };
//     }
// }

// export abstract class ResourceGroup {

//     constructor(private _id: string, private _label: string, private _resources: Resource[]) {

//     }

//     get id(): string { return this._id; }
//     get contextKey(): string { return this._id; }
//     get label(): string { return this._label; }
//     get resources(): Resource[] { return this._resources; }
// }

// export class WorkingTreeGroup extends ResourceGroup {

//     static readonly ID = 'workingTree';

//     constructor(resources: Resource[] = []) {
//         super(WorkingTreeGroup.ID, 'Changes', resources);
//     }
// }

// export enum Operation {
//     Status = 1 << 0,
//     Add = 1 << 1,
//     RevertFiles = 1 << 2,
//     Commit = 1 << 3,
//     Clean = 1 << 4,
//     Branch = 1 << 5,
//     Checkout = 1 << 6,
//     Reset = 1 << 7,
//     Fetch = 1 << 8,
//     Pull = 1 << 9,
//     Push = 1 << 10,
//     Sync = 1 << 11,
//     Init = 1 << 12,
//     Show = 1 << 13,
//     Stage = 1 << 14,
//     GetCommitTemplate = 1 << 15,
//     DeleteBranch = 1 << 16,
//     Merge = 1 << 17,
//     Ignore = 1 << 18
// }

// function isReadOnly(operation: Operation): boolean {
//     switch (operation) {
//         case Operation.Show:
//         case Operation.GetCommitTemplate:
//             return true;
//         default:
//             return false;
//     }
// }

// function shouldShowProgress(operation: Operation): boolean {
//     switch (operation) {
//         case Operation.Fetch:
//             return false;
//         default:
//             return true;
//     }
// }

// export class Model implements Disposable {
//     private _workingTreeGroup = new WorkingTreeGroup([]);
//     get workingTreeGroup(): WorkingTreeGroup { return this._workingTreeGroup; }

//     private _HEAD: Branch | undefined;
//     get HEAD(): Branch | undefined {
//         return this._HEAD;
//     }

//     private _refs: Ref[] = [];
//     get refs(): Ref[] {
//         return this._refs;
//     }

//     private _remotes: Remote[] = [];
//     get remotes(): Remote[] {
//         return this._remotes;
//     }

//     private _operations = new OperationsImpl();
//     get operations(): Operations { return this._operations; }

//     // private repository: Repository;

//     private _state = State.Uninitialized;
//     get state(): State { return this._state; }
//     set state(state: State) {
//         this._state = state;
//         this._HEAD = undefined;
//         this._refs = [];
//         this._remotes = [];
//         this._workingTreeGroup = new WorkingTreeGroup();
//     }

//     private workspaceRoot: Uri;
//     private onWorkspaceChange: Event<Uri>;
//     private isRepositoryHuge = false;
//     private didWarnAboutLimit = false;
//     private disposables: Disposable[] = [];

//     constructor(
//         private _git: Git,
//         workspaceRootPath: string
//     ) {
//         this.workspaceRoot = Uri.file(workspaceRootPath);

//         const fsWatcher = workspace.createFileSystemWatcher('**');
//         this.disposables.push(fsWatcher);

//         this.status();
//     }

//     async getCommit(ref: string): Promise<Commit> {
//         return await this.repository.getCommit(ref);
//     }

//     async show(ref: string, filePath: string): Promise<string> {
//         return await this.run(Operation.Show, async () => {
//             const relativePath = path.relative(this.repository.root, filePath).replace(/\\/g, '/');
//             const configFiles = workspace.getConfiguration('files');
//             const encoding = configFiles.get<string>('encoding');

//             return await this.repository.buffer(`${ref}:${relativePath}`, encoding);
//         });
//     }

//     // private async updateModelState(): Promise<void> {
//     //     const { status, didHitLimit } = await this.repository.getStatus();
//     //     const config = workspace.getConfiguration('git');
//     //     const shouldIgnore = config.get<boolean>('ignoreLimitWarning') === true;

//     //     this.isRepositoryHuge = didHitLimit;

//     //     if (didHitLimit && !shouldIgnore && !this.didWarnAboutLimit) {
//     //         const ok = { title: localize('ok', "OK"), isCloseAffordance: true };
//     //         const neverAgain = { title: localize('neveragain', "Never Show Again") };

//     //         window.showWarningMessage(localize('huge', "The git repository at '{0}' has too many active changes, only a subset of Git features will be enabled.", this.repository.root), ok, neverAgain).then(result => {
//     //             if (result === neverAgain) {
//     //                 config.update('ignoreLimitWarning', true, false);
//     //             }
//     //         });

//     //         this.didWarnAboutLimit = true;
//     //     }

//     //     let HEAD: Branch | undefined;

//     //     try {
//     //         HEAD = await this.repository.getHEAD();

//     //         if (HEAD.name) {
//     //             try {
//     //                 HEAD = await this.repository.getBranch(HEAD.name);
//     //             } catch (err) {
//     //                 // noop
//     //             }
//     //         }
//     //     } catch (err) {
//     //         // noop
//     //     }

//     //     const [refs, remotes] = await Promise.all([this.repository.getRefs(), this.repository.getRemotes()]);

//     //     this._HEAD = HEAD;
//     //     this._refs = refs;
//     //     this._remotes = remotes;

//     //     const index: Resource[] = [];
//     //     const workingTree: Resource[] = [];
//     //     const merge: Resource[] = [];

//     //     status.forEach(raw => {
//     //         const uri = Uri.file(path.join(this.repository.root, raw.path));
//     //         const renameUri = raw.rename ? Uri.file(path.join(this.repository.root, raw.rename)) : undefined;

//     //         switch (raw.x + raw.y) {
//     //             case '??': return workingTree.push(new Resource(this.workspaceRoot, this.workingTreeGroup, uri, Status.UNTRACKED));
//     //             case '!!': return workingTree.push(new Resource(this.workspaceRoot, this.workingTreeGroup, uri, Status.IGNORED));
//     //             case 'DD': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.BOTH_DELETED));
//     //             case 'AU': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.ADDED_BY_US));
//     //             case 'UD': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.DELETED_BY_THEM));
//     //             case 'UA': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.ADDED_BY_THEM));
//     //             case 'DU': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.DELETED_BY_US));
//     //             case 'AA': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.BOTH_ADDED));
//     //             case 'UU': return merge.push(new Resource(this.workspaceRoot, this.mergeGroup, uri, Status.BOTH_MODIFIED));
//     //         }

//     //         let isModifiedInIndex = false;

//     //         switch (raw.x) {
//     //             case 'M': index.push(new Resource(this.workspaceRoot, this.indexGroup, uri, Status.INDEX_MODIFIED)); isModifiedInIndex = true; break;
//     //             case 'A': index.push(new Resource(this.workspaceRoot, this.indexGroup, uri, Status.INDEX_ADDED)); break;
//     //             case 'D': index.push(new Resource(this.workspaceRoot, this.indexGroup, uri, Status.INDEX_DELETED)); break;
//     //             case 'R': index.push(new Resource(this.workspaceRoot, this.indexGroup, uri, Status.INDEX_RENAMED, renameUri)); break;
//     //             case 'C': index.push(new Resource(this.workspaceRoot, this.indexGroup, uri, Status.INDEX_COPIED, renameUri)); break;
//     //         }

//     //         switch (raw.y) {
//     //             case 'M': workingTree.push(new Resource(this.workspaceRoot, this.workingTreeGroup, uri, Status.MODIFIED, renameUri)); break;
//     //             case 'D': workingTree.push(new Resource(this.workspaceRoot, this.workingTreeGroup, uri, Status.DELETED, renameUri)); break;
//     //         }
//     //     });

//     //     this._mergeGroup = new MergeGroup(merge);
//     //     this._indexGroup = new IndexGroup(index);
//     //     this._workingTreeGroup = new WorkingTreeGroup(workingTree);
//     //     this._onDidChangeResources.fire();
//     // }

//     dispose(): void {
//         this.repositoryDisposable.dispose();
//         this.disposables = dispose(this.disposables);
//     }
// }
