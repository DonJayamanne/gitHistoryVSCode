import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: any = [];

export default handleActions<any, ILogEntry[]>({
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
