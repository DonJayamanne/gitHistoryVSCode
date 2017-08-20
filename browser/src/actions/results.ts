import { RootState } from '../reducers';
import { LogEntries } from '../../../src/adapter/git';
import { LogEntry } from '../definitions';
import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';
import { Dispatch, Store } from 'redux';
import axios from 'axios';

export const clearResults = createAction(Actions.CLEAR_RESULTS);
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<Partial<{ logEntries: LogEntries, pageIndex: number, pageSize?: number }>>(Actions.ADD_RESULTS);
export const setAppendResults = createAction<boolean>(Actions.SET_APPEND_RESULTS);
export const goToPreviousPage = createAction<void>(Actions.GO_TO_PREVIOUS_PAGE);
export const goToNextPage = createAction<void>(Actions.GO_TO_NEXT_PAGE);
export const notifyIsLoading = createAction(Actions.IS_LOADING_COMMITS);

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
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex - 1;
        return fetchCommits(dispatch, state, pageIndex);
    };
};
export const getNextCommits = () => {
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        const pageIndex = state.logEntries.pageIndex + 1;
        return fetchCommits(dispatch, state, pageIndex);
    };
};
export const getCommits = () => {
    return (dispatch: Dispatch<any>, getState: () => RootState) => {
        const state = getState();
        return fetchCommits(dispatch, state);
    };
};

function fetchCommits(dispatch: Dispatch<any>, store: RootState, pageIndex: number = 0, pageSize?: number) {
    pageSize = pageSize || store.logEntries.pageSize;
    dispatch(notifyIsLoading());
    return axios.get(`/log?pageSize=${pageSize}&pageIndex=${pageIndex}`)
        .then(result => {
            dispatch(addResults({ logEntries: result.data, pageIndex: pageIndex, pageSize }));
        })
        .catch(err => {
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

