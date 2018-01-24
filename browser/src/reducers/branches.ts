import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { BranchesState } from './';

const initialState: BranchesState = [];

// tslint:disable-next-line:no-any
export default handleActions<BranchesState, any>({
    [Actions.FETCHED_COMMITS]: (state, action: ReduxActions.Action<BranchesState>) => {
        return [
            ...action.payload
        ];
    },

    [Actions.FETCHED_COMMIT]: (state, action: ReduxActions.Action<LogEntry>) => {
        const items = state.items.slice();
        const index = items.findIndex(item => item.hash.full === action.payload.hash.full);
        if (index >= 0) {
            items.splice(index, 1, action.payload);
        }
        return {
            ...state,
            items,
            isLoadingCommit: false,
            selected: action.payload
        };
    },

    [Actions.IS_FETCHING_COMMIT]: (state, action) => {
        return { ...state, isLoadingCommit: true } as LogEntriesState;
    },

    [Actions.CLEAR_RESULTS]: (state, action) => {
        return { ...state, items: [], count: 0, pageIndex: 0, isLoading: false } as LogEntriesState;
    },

    [Actions.SELECT_COMMIT]: (state, action: ReduxActions.Action<LogEntry>) => {
        return { ...state, selected: action.payload } as LogEntriesState;
    },
    // tslint:disable-next-line:no-any
    // [Actions.CLOSE_COMMIT_VIEW]: (state, action: any) => {
    //     return { ...state, selected: undefined } as LogEntriesState;
    // },
    // tslint:disable-next-line:no-any
    [Actions.CLEAR_SELECTED_COMMIT]: (state, action: any) => {
        return { ...state, selected: undefined } as LogEntriesState;
    },

    [Actions.IS_LOADING_COMMITS]: (state, action) => {
        return { ...state, isLoading: true } as LogEntriesState;
    }
}, initialState);
