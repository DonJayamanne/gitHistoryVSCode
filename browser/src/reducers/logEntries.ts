import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { LogEntry } from '../definitions';
import { LogEntriesResponse } from '../types';
import { LogEntriesState } from './';

const initialState: LogEntriesState = {
    count: 0,
    isLoading: false,
    isLoadingCommit: undefined,
    items: [],
    startIndex: 0,
};

function fixDates(logEntry: LogEntry) {
    if (logEntry.author && typeof logEntry.author.date === 'string') {
        logEntry.author.date = new Date(logEntry.author.date);
    }
    if (logEntry.committer && typeof logEntry.committer.date === 'string') {
        logEntry.committer.date = new Date(logEntry.committer.date);
    }
}

export default handleActions<LogEntriesState, any>(
    {
        [Actions.FETCHED_COMMITS]: (state, action: ReduxActions.Action<LogEntriesResponse>) => {
            action.payload!.items.forEach((x, i) => {
                fixDates(x);
                if (state.items[i + action.payload.startIndex] !== undefined) {
                    state.items.splice(i + action.payload.startIndex, 1, x);
                } else {
                    state.items.splice(i + action.payload.startIndex, 0, x);
                }
            });

            return {
                ...state,
                startIndex: action.payload.startIndex,
                stopIndex: action.payload.stopIndex,
                count: action.payload.count,
                selected: undefined,
                isLoading: false,
                isLoadingCommit: undefined,
            };
        },

        [Actions.CLEAR_COMMITS]: (state, action) => {
            state.items = [];
            return {
                ...state,
            };
        },
        [Actions.UPDATE_COMMIT_IN_LIST]: (state, action: ReduxActions.Action<LogEntry>) => {
            const index = state.items.findIndex(item => item.hash.full === action.payload.hash.full);

            if (index >= 0) {
                const logEntry = JSON.parse(JSON.stringify(action.payload));
                fixDates(logEntry);
                state.items.splice(index, 1, logEntry);
            }
            return {
                ...state,
                isLoadingCommit: undefined,
            };
        },
        [Actions.FETCHED_COMMIT]: (state, action: ReduxActions.Action<LogEntry>) => {
            fixDates(action.payload);

            return {
                ...state,
                isLoadingCommit: undefined,
                selected: action.payload,
            };
        },

        [Actions.IS_FETCHING_COMMIT]: (state, action: ReduxActions.Action<string>) => {
            return {
                ...state,
                isLoadingCommit: action.payload,
            } as LogEntriesState;
        },
        [Actions.CLEAR_SELECTED_COMMIT]: (state, action: any) => {
            return { ...state, selected: undefined } as LogEntriesState;
        },

        [Actions.IS_LOADING_COMMITS]: (state, action) => {
            return { ...state, isLoading: true } as LogEntriesState;
        },
    },
    initialState,
);
