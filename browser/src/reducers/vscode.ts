import { handleActions } from 'redux-actions';

export type IConfiguration = {
    sideBySide: boolean;
    logLevel: string;
    pageSize: number;
};

export type IVSCodeSettings = {
    theme?: string;
    locale?: string;
    configuration?: IConfiguration;
};

const initialState = {};

export default handleActions<IVSCodeSettings, any>(
    {
        xxx: (state, action: ReduxActions.Action<number>) => {
            return { ...state };
        },
    },
    initialState,
);
