import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { ActionedUser, Avatar, Branch, ISettings, LogEntriesResponse } from '../definitions';
import authors from './authors';
import avatars from './avatars';
import branches from './branches';
import { default as graph, IGraphState } from './graph';
import logEntries from './logEntries';
import searchCriteria from './searchCriteria';
import settings from './settings';
import vscode, { IVSCodeSettings } from './vscode';

export type LogEntriesState = LogEntriesResponse & {
    isLoading: boolean;
    isLoadingCommit: boolean;
};

export type BranchesState = { name: string; current: boolean }[];
export type AuthorsState = ActionedUser[];
export type AvatarsState = Avatar[];
export type RootState = {
    vscode: IVSCodeSettings;
    logEntries?: LogEntriesState;
    branches?: BranchesState;
    avatars?: AvatarsState;
    authors?: AuthorsState;
    settings?: ISettings;
    searchCriteria: ISearchCriteria;
    graph: IGraphState;
}
export interface ISearchCriteria {
    selectedBranchType?: Branch;
    selectedBranchName?: string;
    pageIndex?: number;
    searchText?: string;
}

export default combineReducers<RootState>({
    routing,
    avatars,
    authors,
    logEntries,
    branches,
    settings,
    searchCriteria,
    graph,
    vscode
} as any);
