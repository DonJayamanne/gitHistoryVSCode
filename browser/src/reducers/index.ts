import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { Branch, ISettings } from '../definitions';
import { LogEntriesResponse } from '../types';
import branches from './branches';
import { default as graph, IGraphState } from './graph';
import logEntries from './logEntries';
import searchCriteria from './searchCriteria';
import settings from './settings';
import vscode, { IVSCodeSettings } from './vscode';

export interface LogEntriesState extends LogEntriesResponse {
    isLoading: boolean;
    isLoadingCommit: boolean;
}
export type BranchesState = { name: string; current: boolean }[];
export interface RootState {
    vscode: IVSCodeSettings;
    logEntries?: LogEntriesState;
    branches?: BranchesState;
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
    logEntries,
    branches,
    settings,
    searchCriteria,
    graph,
    vscode
});
