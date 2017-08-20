import { LogEntriesState } from './';
import { LogEntry, LogEntries } from '../definitions';
import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: LogEntriesState = { count: 0, isLoading: true, items: [], pageIndex: 0, pageSize: 100 };

export default handleActions<LogEntriesState, { logEntries: LogEntries, pageIndex: number }>({
  [Actions.ADD_RESULTS]: (state, action: ReduxActions.Action<{ logEntries: LogEntries, pageIndex: number, pageSize?: number }>) => {
    return {
      ...state,
      items: action.payload!.logEntries.items,
      count: action.payload!.logEntries.count,
      pageIndex: action.payload.pageIndex,
      pageSize: action.payload.pageSize || state.pageSize,
      isLoading: false
    };
  },

  [Actions.CLEAR_RESULTS]: (state, action) => {
    return { ...state, items: [], count: 0, pageIndex: 0, isLoading: true } as LogEntriesState;
  },

  [Actions.IS_LOADING_COMMITS]: (state, action) => {
    return { ...state, isLoading: true } as LogEntriesState;
  }
}, initialState);
