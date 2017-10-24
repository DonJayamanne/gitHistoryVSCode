import axios from 'axios';
import { Dispatch, Store } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { CommittedFile, LogEntry } from '../definitions';
import { RootState } from '../reducers';
import { LogEntries } from '../types';

export const clearResults = createAction(Actions.CLEAR_RESULTS);
// tslint:disable-next-line:no-any
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<Partial<{ logEntries: LogEntries, pageIndex: number, pageSize?: number }>>(Actions.FETCHED_COMMITS);
export const updateCommit = createAction<LogEntry>(Actions.FETCHED_COMMIT);
export const setAppendResults = createAction<boolean>(Actions.SET_APPEND_RESULTS);
export const goToPreviousPage = createAction<void>(Actions.GO_TO_PREVIOUS_PAGE);
export const goToNextPage = createAction<void>(Actions.GO_TO_NEXT_PAGE);
export const notifyIsLoading = createAction(Actions.IS_LOADING_COMMITS);
export const notifyIsFetchingCommit = createAction(Actions.IS_FETCHING_COMMIT);

// function buildQueryString(settings: ISettings): string {
//     if (!settings) {
//       return '/log';
//     }
//     const queryArgs = [];
//     if (settings.searchText && settings.searchText.length > 0) {
//       queryArgs.push(`searchText=${encodeURIComponent(settings.searchText)}`);
//     }
//     if (settings.pageIndex && settings.pageIndex > 0) {
//       queryArgs.push(`pageIndex=${settings.pageIndex}`);
//     }
//     if (settings.selectedBranchType) {
//       switch (settings.selectedBranchType) {
//         case Branch.All: {
//           queryArgs.push(`branchType=ALL`);
//           break;
//         }
//         case Branch.Current: {
//           queryArgs.push(`branchType=CURRENT`);
//           break;
//         }
//       }
//     }

//     return `/log` + (queryArgs.length === 0 ? '' : `?${queryArgs.join('&')}`);
//   }

export const getPreviousCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex - 1;
        return fetchCommits(dispatch, state, pageIndex);
    };
};
export const actionACommit = (logEntry: LogEntry) => () => {
    return axios.post(`/log/${logEntry.hash.full}`, logEntry.hash.full);
};
export const selectCommittedFile = (logEntry: LogEntry, committedFile: CommittedFile) => () => {
    return notifyCommittedFileSelected(logEntry, committedFile);
};

function notifyCommittedFileSelected(logEntry: LogEntry, committedFile: CommittedFile) {
    return axios.post(`/log/${logEntry.hash.full}/committedFile`, committedFile)
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            debugger;
            console.error('Result failed');
            console.error(err);
        });
}
export const cherryPickCommit = (logEntry: LogEntry) => () => {
    return axios.post(`/log/${logEntry.hash.full}/cherryPick`, logEntry.hash.full);
};

export const viewCommit = (hash: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommit(dispatch, state, hash);
    };
};
export const getNextCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex + 1;
        return fetchCommits(dispatch, state, pageIndex);
    };
};
export const getCommits = (id?: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state);
    };
};

// tslint:disable-next-line:no-any
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex: number = 0, pageSize?: number) {
    pageSize = pageSize || store.logEntries.pageSize;
    const id = store.settings.id || '';
    const branch = store.settings.selectedBranchName || '';
    const queryParts = [];
    queryParts.push(`pageIndex=${pageIndex}`);
    queryParts.push(`id=${encodeURIComponent(id)}`);
    queryParts.push(`branch=${encodeURIComponent(branch)}`);
    if (pageSize) {
        queryParts.push(`pageSize=${pageSize}`);
    }
    dispatch(notifyIsLoading());
    return axios.get(`/log?${queryParts.join('&')}`)
        .then(result => {
            dispatch(addResults({ logEntries: result.data, pageIndex: pageIndex, pageSize }));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            debugger;
            console.error('Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchCommit(dispatch: Dispatch<any>, store: RootState, hash: string) {
    dispatch(notifyIsFetchingCommit());
    const id = store.settings.id || '';
    return axios.get(`/log/${hash}?id=${encodeURIComponent(id)}`)
        .then(result => {
            dispatch(updateCommit(result.data));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            debugger;
            console.error('Result failed');
            console.error(err);
        });
}
// export const fetchLogEntries = (pageIndex: number, pageSize: number) => {
//     return (dispatch: Dispatch<any>, getState: () => RootState) => {
//         return axios.get(`/log?pageSize=${pageSize}&pageIndex=${pageIndex}`)
//             .then(result => {
//                 debugger;
//                 const x = getState();

//                 dispatch(addResults({ logEntries: result.data, pageIndex: pageIndex }));
//             })
//             .catch(err => {
//                 debugger;
//                 console.error('Result failed');
//                 console.error(err);
//             });
//     };
// };

export const logViewSizeCalculated = createAction<{ height: string, width: string }>(Actions.LOGVIEW_SIZE_CALCULATED);
export const logEntryHeightCalculated = createAction<number>(Actions.LOGENTRY_ITEM_HEIGHT_CALCULATED);
export const commitsRendered = createAction(Actions.COMMITS_RENDERED);
export const selectCommit = createAction<LogEntry>(Actions.SELECT_COMMIT);
export const closeCommitView = createAction(Actions.CLOSE_COMMIT_VIEW);
export const closeCommittedFile = createAction(Actions.CLOSE_COMMIT_VIEW);
