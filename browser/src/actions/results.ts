import axios from 'axios';
import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { ActionedUser, Avatar, CommittedFile, LogEntriesResponse, LogEntry } from '../definitions';
import { BranchesState, RootState } from '../reducers';

// tslint:disable:no-any
export const clearResults = createAction(Actions.CLEAR_RESULTS);
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<Partial<LogEntriesResponse>>(Actions.FETCHED_COMMITS);
export const updateCommit = createAction<LogEntry>(Actions.FETCHED_COMMIT);
export const updateBranchList = createAction<BranchesState>(Actions.FETCHED_BRANCHES);
export const clearCommitSelection = createAction(Actions.CLEAR_SELECTED_COMMIT);
export const setAppendResults = createAction<boolean>(Actions.SET_APPEND_RESULTS);
export const goToPreviousPage = createAction<void>(Actions.GO_TO_PREVIOUS_PAGE);
export const goToNextPage = createAction<void>(Actions.GO_TO_NEXT_PAGE);
export const notifyIsLoading = createAction(Actions.IS_LOADING_COMMITS);
export const notifyIsFetchingCommit = createAction(Actions.IS_FETCHING_COMMIT);
export const fetchedAvatar = createAction<Avatar[]>(Actions.FETCHED_AVATARS);
export const fetchedAuthors = createAction<ActionedUser[]>(Actions.FETCHED_AUTHORS);

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

export const actionNewRef = (logEntry: LogEntry) => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `/branch/${logEntry.hash.full}`);
        return axios.post(url, logEntry);
    };
};

// tslint:disable-next-line:no-any
export const fetchAvatars = async (dispatch: Dispatch<any>, getState: () => RootState) => {
    const state = getState();
    const url = getQueryUrl(state, '/avatars');

    axios.post(url)
        .then(result => {
            dispatch(fetchedAvatar(result.data as Avatar[]));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            console.error('Git History: Avatar request failed');
            console.error(err);
        });
};
export const selectCommittedFile = (logEntry: LogEntry, committedFile: CommittedFile) => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `/log/${logEntry.hash.full}/committedFile`);
        await axios.post(url, { logEntry, committedFile })
            .catch(err => {
                // tslint:disable-next-line:no-debugger
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
        return fetchCommits(dispatch, state, 0, undefined, searchText, true, undefined, '');
    };
};
export const clearSearch = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined, '', true, undefined, '');
    };
};
export const selectBranch = (branchName: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined, '', true, branchName);
    };
};
export const selectAuthor = (authorName: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined, undefined, true, undefined, authorName);
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
export const getBranches = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchBranches(dispatch, state);
    };
};
export const getAuthors = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchAuthors(dispatch, state);
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
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex?: number, pageSize?: number, searchText?: string, refreshData?: boolean, branchName?: string, author?: string) {
    // pageSize = pageSize || store.logEntries.pageSize;
    const id = store.settings.id || '';
    const queryParts = [];
    queryParts.push(`id=${encodeURIComponent(id)}`);
    if (typeof branchName === 'string') {
        queryParts.push(`branch=${encodeURIComponent(branchName)}`);
    }
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
    if (typeof author === 'string') {
        queryParts.push(`author=${author}`);
    }
    if (pageSize) {
        queryParts.push(`pageSize=${pageSize}`);
    }
    dispatch(notifyIsLoading());
    return axios.get(`/log?${queryParts.join('&')}`)
        .then((result: { data: LogEntriesResponse }) => {
            if (Array.isArray(result.data.items)) {
                result.data.items.forEach(item => {
                    fixDates(item);
                });
            }
            dispatch(addResults(result.data));
            fetchAvatars(dispatch, () => store);
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            console.error('Git History: Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchCommit(dispatch: Dispatch<any>, store: RootState, hash: string) {
    dispatch(notifyIsFetchingCommit());
    const id = store.settings.id || '';
    return axios.get(`/log/${hash}?id=${encodeURIComponent(id)}`)
        .then((result: { data: LogEntry }) => {
            if (result.data) {
                fixDates(result.data);
            }
            dispatch(updateCommit(result.data));
            fetchAvatars(dispatch, () => store);
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            console.error('Git History: Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchBranches(dispatch: Dispatch<any>, store: RootState) {
    const id = store.settings.id || '';
    return axios.get(`/branches?id=${encodeURIComponent(id)}`)
        .then(result => {
            dispatch(updateBranchList(result.data));
        })
        .catch(err => {
            console.error('Git History: Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchAuthors(dispatch: Dispatch<any>, store: RootState) {
    const id = store.settings.id || '';
    return axios.get(`/authors?id=${encodeURIComponent(id)}`)
        .then(result => {
            dispatch(fetchedAuthors(result.data));
        })
        .catch(err => {
            console.error('Git History: Fetch Authors: Result failed');
            console.error(err);
        });
}

export const commitsRendered = createAction<number>(Actions.COMMITS_RENDERED);

