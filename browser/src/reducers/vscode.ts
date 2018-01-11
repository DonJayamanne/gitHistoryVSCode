import { handleActions } from 'redux-actions';

export type IVSCodeSettings = {
  theme?: string;
  locale?: string;
};


const initialState = {
};

export default handleActions<IVSCodeSettings, any>({
  'xxx': (state, action: ReduxActions.Action<number>) => {
    return { ...state };
  },
}, initialState);
