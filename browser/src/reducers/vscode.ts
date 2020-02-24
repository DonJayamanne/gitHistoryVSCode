import { handleActions } from 'redux-actions';

export type IConfiguration = {
  logLevel: string;
  pageSize: number;
}

export type IVSCodeSettings = {
  theme?: string;
  locale?: string;
  configuration?: IConfiguration;
  api?: any;
};


const initialState = {
};

export default handleActions<IVSCodeSettings, any>({
  'xxx': (state, action: ReduxActions.Action<number>) => {
    return { ...state };
  },
}, initialState);
