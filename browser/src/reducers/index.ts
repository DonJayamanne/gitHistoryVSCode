import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { ActionedUser, Avatar, ISettings, LogEntriesResponse } from '../definitions';
import authors from './authors';
import avatars from './avatars';
import branches from './branches';
import settings from './settings';
import graph from './graph';
import logEntries from './logEntries';
import vscode, { IVSCodeSettings } from './vscode';
import { Graph } from '../../../src/types';

export type LogEntriesState = LogEntriesResponse & {
    isLoading: boolean;
    isLoadingCommit?: string;
};

export type BranchesState = {
    name: string;
    current: boolean;
    remote: string;
    remoteType: number;
}[];
export type AuthorsState = ActionedUser[];
export type AvatarsState = Avatar[];
export type RootState = {
    vscode: IVSCodeSettings;
    logEntries?: LogEntriesState;
    branches?: BranchesState;
    avatars?: AvatarsState;
    authors?: AuthorsState;
    settings?: ISettings;
    graph: Graph;
};

export default combineReducers<RootState>({
    routing,
    avatars,
    authors,
    logEntries,
    branches,
    settings,
    graph,
    vscode,
} as any);
