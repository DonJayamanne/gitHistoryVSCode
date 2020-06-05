import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { Graph } from '../../../src/types';

export interface IGraphState {
    width?: string;
    height?: number;
    itemHeight?: number;
    startIndex?: number;
}
const initialState: IGraphState = {};

export default handleActions<IGraphState, any>(
    {
        [Actions.COMMITS_RENDERED]: (state, action: ReduxActions.Action<Graph>) => {
            return {
                ...state,
                ...action.payload,
            } as IGraphState;
        },
    },
    initialState,
);
