import { LogEntriesResponse } from '../types';
import { Branch, ISettings, LogEntries, LogEntry } from '../definitions';
import { routerReducer as routing, RouteActions } from 'react-router-redux';
import { combineReducers, Reducer } from 'redux';
import logEntries from './logEntries';
import vscode, { IVSCodeSettings } from './vscode';
import searchCriteria from './searchCriteria';
import settings from './settings';
import { default as graph, IGraphState } from './graph';

export interface LogEntriesState extends LogEntriesResponse {
    isLoading: boolean;
    isLoadingCommit: boolean;
}
export interface RootState {
    vscode: IVSCodeSettings;
    logEntries?: LogEntriesState;
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
    settings,
    searchCriteria,
    graph,
    vscode
});
