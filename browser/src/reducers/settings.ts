import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState = {};

export default handleActions<any, any>({
  [Actions.UPDATE_SETTINGS]: (state, action) => {
    return { ...state, ...action.payload };
  }
}, initialState);
