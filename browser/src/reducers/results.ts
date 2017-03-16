import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: NotebookResultsState = [];

export default handleActions<NotebookResultsState, any>({
  [Actions.ADD_RESULT]: (state, action) => {
    return [action.payload, ...state];
  },

  [Actions.ADD_RESULTS]: (state, action) => {
    return [...state, ...action.payload];
  },

  [Actions.CLEAR_RESULTS]: (state, action) => {
    return [];
  }
}, initialState);
