import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

export type IVSCodeSettings = {
  theme?: string;
};


const initialState = {
};

export default handleActions<IVSCodeSettings, any>({
  'xxx': (state, action: ReduxActions.Action<number>) => {
    return { ...state };
  },
}, initialState);
