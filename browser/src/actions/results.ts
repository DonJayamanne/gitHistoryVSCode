import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { ActionedUser, Avatar, CommittedFile, LogEntriesResponse, LogEntry, Ref } from '../definitions';
import { BranchesState, RootState } from '../reducers';
import { BranchSelection } from '../types';

// tslint:disable:no-any
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
        // tslint:disable-next-line:no-any
        return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(notifyIsFetchingCommit(logEntry.hash.full));

            const store = getState();

            store.vscode.api.postMessage({
                cmd: 'doAction',
                args: { 
                    ...store.settings,
                    logEntry,
                    name,
                    value
                }
            });
        };
    };
    export const actionRef = (logEntry: LogEntry, ref: Ref, name: string = '') => {
        // tslint:disable-next-line:no-any
        return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            dispatch(notifyIsFetchingCommit(logEntry.hash.full));
            const store = getState();

            store.vscode.api.postMessage({
                cmd: 'doActionRef',
                args: { 
                    ...store.settings,
                    ref,
                    name,
                    hash: logEntry.hash.full
                }
            });
        };
    };
    export const fetchAvatars = async (dispatch: Dispatch<any>, getState: () => RootState) => {
        const store = getState();
        store.vscode.api.postMessage({
            cmd: 'getAvatars',
            args: { 
                ...store.settings
            }
        });
    };
    export const selectCommittedFile = (logEntry: LogEntry, committedFile: CommittedFile) => {
        // tslint:disable-next-line:no-any
        return async (dispatch: Dispatch<any>, getState: () => RootState) => {
            const store = getState();

            store.vscode.api.postMessage({
                cmd: 'selectCommittedFile',
                args: { 
                    ...store.settings,
                    logEntry,
                    committedFile
                }
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
    export const selectBranch = (branchName: string, branchSelection: BranchSelection) => {
        // tslint:disable-next-line:no-any
        return (dispatch: Dispatch<any>, getState: () => RootState) => {
            //state.settings.branchName = branchName;
            dispatch(updateSettings({ branchName, branchSelection }));
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
}
// tslint:disable-next-line:no-any
function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex?: number, pageSize?: number) {
    store.vscode.api.postMessage({
        cmd: 'getLogEntries',
        args: { 
            ...store.settings, 
            pageIndex,
            pageSize
        }
    });
}
// tslint:disable-next-line:no-any
function fetchCommit(dispatch: Dispatch<any>, store: RootState, hash: string) {
    dispatch(notifyIsFetchingCommit(hash));
    store.vscode.api.postMessage({
        cmd: 'getCommit',
        args: { ...store.settings, hash }
    });
}
// tslint:disable-next-line:no-any
function fetchBranches(dispatch: Dispatch<any>, store: RootState) {
    store.vscode.api.postMessage({
        cmd: 'getBranches',
        args: store.settings
    });
}
// tslint:disable-next-line:no-any
function fetchAuthors(dispatch: Dispatch<any>, store: RootState) {
    store.vscode.api.postMessage({
        cmd: 'getAuthors',
        args: store.settings
    });
}

export class PostMessageResult {
    constructor(private dispatch: Dispatch<any>, private getState: () => RootState) {
        window.addEventListener('message', this.postMessageParser.bind(this));
    }

    private postMessageParser = async (event: MessageEvent) => {
        const message = event.data;
        await this[message.cmd](message.args, message.error!);
    }

    // @ts-ignore
    private getLogEntriesResult = async (args: any, error: any) => {
        this.dispatch(addResults(args));
        ResultActions.fetchAvatars(this.dispatch, this.getState);
    }
    // @ts-ignore
    private getBranchesResult = async (args: any, error: any) => {
        this.dispatch(updateBranchList(args));
    }
    // @ts-ignore
    private getAuthorsResult = async (args: any, error: any) => {
        this.dispatch(fetchedAuthors(args));
    }
    // @ts-ignore
    private getCommitResult = async (args: any, error: any) => {
        this.dispatch(updateCommit(args));
    }
    // @ts-ignore
    private getAvatarsResult = async (args: any, error: any) => {
        if (!args) return;
        this.dispatch(fetchedAvatar(args as Avatar[]));
    }
    // @ts-ignore
    private doActionResult = async (args: any) => {
        const name = args.name;

        switch (name) {
            case 'reset_soft':
            case 'reset_hard':
                this.dispatch(ResultActions.refresh());
                break;
            case 'newtag':
                break;
            case 'newbranch':
                this.dispatch(ResultActions.getBranches());
                break;
        }

        this.dispatch(updateCommitInList(args.logEntry as LogEntry));
    }
    // @ts-ignore
    private doActionRefResult = async (args: any) => {
        this.dispatch(ResultActions.getBranches());
        this.dispatch(updateCommitInList(args.logEntry));
    }
}