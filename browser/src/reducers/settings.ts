import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

const initialState: any = {
  appendResults: true
};

export default handleActions<any, any>({
  [Actions.SET_APPEND_RESULTS]: (state, action) => {
    return { ...state, appendResults: action.payload };
  }
}, initialState);
