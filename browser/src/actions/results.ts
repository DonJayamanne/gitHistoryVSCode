import axios from 'axios';
import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { ActionedUser, Avatar, CommittedFile, LogEntriesResponse, LogEntry, Ref } from '../definitions';
import { BranchesState, RootState } from '../reducers';

// tslint:disable:no-any
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<Partial<LogEntriesResponse>>(Actions.FETCHED_COMMITS);
export const updateCommit = createAction<LogEntry>(Actions.FETCHED_COMMIT);
export const updateSettings = createAction(Actions.UPDATE_SETTINGS);
export const updateBranchList = createAction<BranchesState>(Actions.FETCHED_BRANCHES);
export const clearCommitSelection = createAction(Actions.CLEAR_SELECTED_COMMIT);
export const goToPreviousPage = createAction<void>(Actions.GO_TO_PREVIOUS_PAGE);
export const goToNextPage = createAction<void>(Actions.GO_TO_NEXT_PAGE);
export const notifyIsLoading = createAction(Actions.IS_LOADING_COMMITS);
export const notifyIsFetchingCommit = createAction(Actions.IS_FETCHING_COMMIT);
export const fetchedAvatar = createAction<Avatar[]>(Actions.FETCHED_AVATARS);
export const fetchedAuthors = createAction<ActionedUser[]>(Actions.FETCHED_AUTHORS);

function getQueryUrl(store: RootState, baseUrl: string, args: string[] = []): string {
    const id = store.settings.id || '';
    const queryArgs = args.concat([`id=${encodeURIComponent(id)}`]);
    const serverurl = window['server_url'];
    return `${serverurl}${baseUrl}?${queryArgs.join('&')}`;
}
export const actionCommit = (logEntry: LogEntry, name: string = '', value: string = '') => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `action/${name}`, [`value=${encodeURIComponent(value)}`]);
        return axios.post(url, logEntry).then(result => {
            switch (name) {
                case 'reset_soft':
                case 'reset_hard':
                case 'newtag':
                    dispatch(refresh());
                    break;
                case 'newbranch':
                    dispatch(getBranches());
                    dispatch(refresh());
                    break;
            }
        });
    };
};

export const actionRef = (ref: Ref, name: string = '') => {
    // tslint:disable-next-line:no-any
    return async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const url = getQueryUrl(state, `actionref/${name}`);
        return axios.post(url, ref).then(result => {
            dispatch(refresh());
        });
    };
};

// tslint:disable-next-line:no-any
export const fetchAvatars = async (dispatch: Dispatch<any>, getState: () => RootState) => {
    const state = getState();
    const url = getQueryUrl(state, 'avatars');

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
        const url = getQueryUrl(state, `log/${logEntry.hash.full}/committedFile`);
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
            await dispatch(clearCommitSelection());
        }
    };
};
export const getNextCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex + 1;
        return fetchCommits(dispatch, state, pageIndex, undefined);
    };
};
export const getPreviousCommits = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex - 1;
        return fetchCommits(dispatch, state, pageIndex, undefined);
    };
};
export const search = (searchText: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        dispatch(updateSettings({ searchText }));
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined);
    };
};
export const clearSearch = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        dispatch(updateSettings({ searchText: '', authorFilter: undefined }));
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined);
    };
};
export const selectBranch = (branchName: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        //state.settings.branchName = branchName;
        dispatch(updateSettings({ branchName }));
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined);
    };
};
export const selectAuthor = (authorName: string) => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        dispatch(updateSettings({ authorFilter: authorName }));
        const state = getState();
        return fetchCommits(dispatch, state, 0, undefined);
    };
};
export const refresh = () => {
    // tslint:disable-next-line:no-any
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        // update branches
        fetchBranches(dispatch, state);
        return fetchCommits(dispatch, state, undefined, undefined);
    };
};
export const getCommits = () => {
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
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex?: number, pageSize?: number) {
    const queryParts = [];

    if (store.settings.branchName) {
        queryParts.push(`branch=${encodeURIComponent(store.settings.branchName)}`);
    }
    if (store.settings.file) {
        queryParts.push(`file=${encodeURIComponent(store.settings.file)}`);
    }
    if (store.settings.searchText) {
        queryParts.push(`searchText=${encodeURIComponent(store.settings.searchText)}`);
    }
    if (typeof pageIndex === 'number') {
        queryParts.push(`pageIndex=${pageIndex}`);
    }
    if (store.settings.authorFilter) {
        queryParts.push(`author=${store.settings.authorFilter}`);
    }
    if (pageSize) {
        queryParts.push(`pageSize=${pageSize}`);
    }
    dispatch(notifyIsLoading());
    return axios.get(getQueryUrl(store, 'log', queryParts))
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
    return axios.get(getQueryUrl(store, `log/${hash}`))
        .then((result: { data: LogEntry }) => {
            if (result.data) {
                fixDates(result.data);
            }
            dispatch(updateCommit(result.data));
        })
        .catch(err => {
            // tslint:disable-next-line:no-debugger
            console.error('Git History: Result failed');
            console.error(err);
        });
}
// tslint:disable-next-line:no-any
function fetchBranches(dispatch: Dispatch<any>, store: RootState) {
    return axios.get(getQueryUrl(store, 'branches'))
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
    return axios.get(getQueryUrl(store,'authors'))
        .then(result => {
            dispatch(fetchedAuthors(result.data));
        })
        .catch(err => {
            console.error('Git History: Fetch Authors: Result failed');
            console.error(err);
        });
}

export const commitsRendered = createAction<number>(Actions.COMMITS_RENDERED);

