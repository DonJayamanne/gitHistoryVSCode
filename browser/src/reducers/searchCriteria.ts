import { ISearchCriteria } from './';
import { LogEntry, LogEntries } from '../definitions';
import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: any = [];

export default handleActions<ISearchCriteria, Partial<ISearchCriteria>>({
  [Actions.UPDATE_SEARCH_CRITERIA]: (state, action) => {
    return { ...state, ...action.payload };
  },

  [Actions.RESET_SEARCH_CRITERIA]: (state, action) => {
    return {} as ISearchCriteria;
  }
}, initialState);
