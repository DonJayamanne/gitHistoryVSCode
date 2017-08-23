import { LogEntriesState } from './';
import { LogEntry, LogEntries } from '../definitions';
import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: LogEntriesState = { count: 0, isLoading: true, isLoadingCommit: false, items: [], pageIndex: 0, pageSize: 100 };

export default handleActions<LogEntriesState, any>({
  [Actions.FETCHED_COMMITS]: (state, action: ReduxActions.Action<{ logEntries: LogEntries, pageIndex: number, pageSize?: number }>) => {
    return {
      ...state,
      items: action.payload!.logEntries.items,
      count: action.payload!.logEntries.count,
      pageIndex: action.payload.pageIndex,
      pageSize: action.payload.pageSize || state.pageSize,
      isLoading: false
    };
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
    return { ...state, items: [], count: 0, pageIndex: 0, isLoading: true } as LogEntriesState;
  },

  [Actions.SELECT_COMMIT]: (state, action: ReduxActions.Action<LogEntry>) => {
    return { ...state, selected: action.payload } as LogEntriesState;
  },
  [Actions.CLOSE_COMMIT_VIEW]: (state, action: any) => {
    return { ...state, selected: undefined } as LogEntriesState;
  },

  [Actions.IS_LOADING_COMMITS]: (state, action) => {
    return { ...state, isLoading: true } as LogEntriesState;
  }
}, initialState);
