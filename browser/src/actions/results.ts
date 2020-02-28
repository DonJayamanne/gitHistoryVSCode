import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { ActionedUser, Avatar, CommittedFile, LogEntriesResponse, LogEntry, Ref } from '../definitions';
import { BranchesState, RootState } from '../reducers';
import { BranchSelection, Branch, } from '../types';
import { post } from '../actions/messagebus';

export const addResults = createAction<Partial<LogEntriesResponse>>(Actions.FETCHED_COMMITS);
export const updateCommit = createAction<LogEntry>(Actions.FETCHED_COMMIT);
export const updateCommitInList = createAction<LogEntry>(Actions.UPDATE_COMMIT_IN_LIST);
export const updateSettings = createAction(Actions.UPDATE_SETTINGS);
export const updateBranchList = createAction<BranchesState>(Actions.FETCHED_BRANCHES);
export const clearCommitSelection = createAction(Actions.CLEAR_SELECTED_COMMIT);
export const goToPreviousPage = createAction<void>(Actions.GO_TO_PREVIOUS_PAGE);
export const goToNextPage = createAction<void>(Actions.GO_TO_NEXT_PAGE);
export const notifyIsLoading = createAction(Actions.IS_LOADING_COMMITS);
export const notifyIsFetchingCommit = createAction<string>(Actions.IS_FETCHING_COMMIT);
export const fetchedAvatar = createAction<Avatar[]>(Actions.FETCHED_AVATARS);
export const fetchedAuthors = createAction<ActionedUser[]>(Actions.FETCHED_AUTHORS);

export namespace ResultActions {
    export const commitsRendered = createAction<number>(Actions.COMMITS_RENDERED);

    export const actionCommit = (logEntry: LogEntry, name: string = '', value: string = '') => {
                return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(notifyIsFetchingCommit(logEntry.hash.full));

            const store = getState();

            post<LogEntry>('doAction', { 
                ...store.settings,
                logEntry,
                name,
                value
            }).then(x => {
                switch (name) {
                    case 'reset_soft':
                    case 'reset_hard':
                        dispatch(ResultActions.refresh());
                        break;
                    case 'newtag':
                        break;
                    case 'newbranch':
                        dispatch(ResultActions.getBranches());
                        break;
                }
        
                dispatch(updateCommitInList(x));
            });
        };
    };
    export const actionRef = (logEntry: LogEntry, ref: Ref, name: string = '') => {
                return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(notifyIsFetchingCommit(logEntry.hash.full));
            const store = getState();

            post<LogEntry>('doActionRef', { 
                ...store.settings,
                ref,
                name,
                hash: logEntry.hash.full
            }).then(x => {        
                dispatch(ResultActions.getBranches());
                dispatch(updateCommitInList(x));
            });
        };
    };
    export const fetchAvatars = () =>  {
        return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            const store = getState();

            post<Avatar[]>('getAvatars', { 
                ...store.settings
            }).then(x => {        
                dispatch(fetchedAvatar(x));
            });
        }
    };
    export const selectCommittedFile = (logEntry: LogEntry, committedFile: CommittedFile) => {
                return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            const store = getState();

            post<void>('selectCommittedFile', { 
                ...store.settings,
                logEntry,
                committedFile
            });
        };
    };
    export const closeCommitView = () => {
                return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            await dispatch(clearCommitSelection());
        };
    };
    export const selectCommit = (hash?: string) => {
                return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            if (hash) {
                await fetchCommit(dispatch, state, hash);
            } else {
                await dispatch(clearCommitSelection());
            }
        };
    };
    export const getNextCommits = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            const pageIndex = state.logEntries.pageIndex + 1;
            return fetchCommits(dispatch, state, pageIndex, undefined);
        };
    };
    export const getPreviousCommits = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            const pageIndex = state.logEntries.pageIndex - 1;
            return fetchCommits(dispatch, state, pageIndex, undefined);
        };
    };
    export const search = (searchText: string) => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(updateSettings({ searchText }));
            const state = getState();
            return fetchCommits(dispatch, state, 0, undefined);
        };
    };
    export const clearSearch = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(updateSettings({ searchText: '', authorFilter: undefined }));
            const state = getState();
            return fetchCommits(dispatch, state, 0, undefined);
        };
    };
    export const selectBranch = (branchName: string, branchSelection: BranchSelection) => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            //state.settings.branchName = branchName;
            dispatch(updateSettings({ branchName, branchSelection }));
            const state = getState();
            return fetchCommits(dispatch, state, 0, undefined);
        };
    };
    export const selectAuthor = (authorName: string) => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(updateSettings({ authorFilter: authorName }));
            const state = getState();
            return fetchCommits(dispatch, state, 0, undefined);
        };
    };
    export const refresh = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            // update branches
            fetchBranches(dispatch, state);
            return fetchCommits(dispatch, state, undefined, undefined);
        };
    };

    export function getCommits() {
        return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            fetchCommits(dispatch, state);
        };
    };
    export const getBranches = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            return fetchBranches(dispatch, state);
        };
    };
    export const getAuthors = () => {
                return (dispatch: Dispatch<any>, getState: () => RootState) => {
            const state = getState();
            return fetchAuthors(dispatch, state);
        };
    };
}
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex?: number, pageSize?: number) {
    dispatch(notifyIsLoading());
    post<LogEntriesResponse>('getLogEntries', { 
        ...store.settings,
        pageIndex,
        pageSize
    }).then(x => {
        dispatch(addResults(x));
    });
}
function fetchCommit(dispatch: Dispatch<any>, store: RootState, hash: string) {
    dispatch(notifyIsFetchingCommit(hash));
    post<LogEntry>('getCommit', { 
        ...store.settings,
        hash
    }).then(x => {
        dispatch(updateCommit(x))
    });
}
function fetchBranches(dispatch: Dispatch<any>, store: RootState) {
    post<Branch[]>('getBranches', { 
        ...store.settings
    }).then(x => {
        dispatch(updateBranchList(x))
    });

}
function fetchAuthors(dispatch: Dispatch<any>, store: RootState) {
    post<ActionedUser[]>('getAuthors', { 
        ...store.settings
    }).then(x => {
        dispatch(fetchedAuthors(x));
    });
}
