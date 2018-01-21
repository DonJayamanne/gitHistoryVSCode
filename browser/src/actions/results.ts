import axios from 'axios';
import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { CommittedFile, LogEntriesResponse, LogEntry } from '../definitions';
import { RootState } from '../reducers';

export const clearResults = createAction(Actions.CLEAR_RESULTS);
// tslint:disable-next-line:no-any
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<Partial<LogEntriesResponse>>(Actions.FETCHED_COMMITS);
export const updateCommit = createAction<LogEntry>(Actions.FETCHED_COMMIT);
export const clearCommitSelection = createAction(Actions.CLEAR_SELECTED_COMMIT);
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

function getQueryUrl(store: RootState, baseUrl: string, args: string[] = []): string {
    const id = store.settings.id || '';
    const queryArgs = args.concat([`id=${encodeURIComponent(id)}`]);
    return `${baseUrl}?${queryArgs.join('&')}`;
}
export const actionACommit = (logEntry: LogEntry) => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `/log/${logEntry.hash.full}`);
        return axios.post(url, logEntry);
    };
};
export const selectCommittedFile = (logEntry: LogEntry, committedFile: CommittedFile) => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `/log/${logEntry.hash.full}/committedFile`);
        await axios.post(url, { logEntry, committedFile })
            .catch(err => {
                // tslint:disable-next-line:no-debugger
                debugger;
                console.error('Git History: Result failed');
                console.error(err);
            });
    };
};
export const closeCommitView = () => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, '/log/clearSelection');
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        await axios.post(url);
        await dispatch(clearCommitSelection());
    };
};
export const selectCommit = (hash?: string) => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        if (hash) {
            await fetchCommit(dispatch, state, hash);
        } else {
            const url = getQueryUrl(state, '/log/clearSelection');
            // tslint:disable-next-line:no-backbone-get-set-outside-model
            await axios.get(url);
            await dispatch(clearCommitSelection());
        }
    };
};
export const getNextCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex + 1;
        return fetchCommits(dispatch, state, pageIndex, undefined, undefined);
    };
};
export const getPreviousCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex - 1;
        return fetchCommits(dispatch, state, pageIndex, undefined, undefined);
    };
};
export const search = (searchText: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined, searchText);
    };
};
export const refresh = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state, undefined, undefined, undefined, true);
    };
};
export const getCommits = (id?: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state);
    };
};
function fixDates(logEntry: LogEntry) {
    if (logEntry.author && typeof logEntry.author.date === 'string') {
        logEntry.author.date = new Date(logEntry.author.date);
    }
    if (logEntry.committer && typeof logEntry.committer.date === 'string') {
        logEntry.committer.date = new Date(logEntry.committer.date);
    }
}
// tslint:disable-next-line:no-any
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex?: number, pageSize?: number, searchText?: string, refreshData?: boolean) {
    // pageSize = pageSize || store.logEntries.pageSize;
    const id = store.settings.id || '';
    const queryParts = [];
    queryParts.push(`id=${encodeURIComponent(id)}`);
    // if (store.settings.selectedBranchName) {
    //     queryParts.push(`branch=${encodeURIComponent(store.settings.selectedBranchName)}`);
    // }
    // if (store.settings.file) {
    //     queryParts.push(`file=${encodeURIComponent(store.settings.file)}`);
    // }
    // if (store.settings.selectedBranchType) {
    //     queryParts.push(`branchSelection=${encodeURIComponent(store.settings.selectedBranchType.toString())}`);
    // }
    if (typeof searchText === 'string') {
        queryParts.push(`searchText=${encodeURIComponent(searchText)}`);
    }
    if (refreshData === true) {
        queryParts.push('refresh=true');
    }
    if (typeof pageIndex === 'number') {
        queryParts.push(`pageIndex=${pageIndex}`);
    }
    if (pageSize) {
        queryParts.push(`pageSize=${pageSize}`);
    }
    dispatch(notifyIsLoading());
    return axios.get(`/log?${queryParts.join('&')}`)
        .then((result: { data: LogEntriesResponse }) => {
            if (Array.isArray(result.data.items)) {
                result.data.items.forEach(fixDates);
            }
            dispatch(addResults(result.data));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            debugger;
            console.error('Git History: Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchCommit(dispatch: Dispatch<any>, store: RootState, hash: string) {
    dispatch(notifyIsFetchingCommit());
    const id = store.settings.id || '';
    return axios.get(`/log/${hash}?id=${encodeURIComponent(id)}`)
        .then(result => {
            if (result.data) {
                fixDates(result.data);
            }
            dispatch(updateCommit(result.data));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            debugger;
            console.error('Git History: Result failed');
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
// export const doSomethingWithCommit = createAction<LogEntry>(Actions.SELECT_COMMIT);
// export const closeCommitView = createAction(Actions.CLOSE_COMMIT_VIEW);
// export const closeCommittedFile = createAction(Actions.CLOSE_COMMIT_VIEW);
