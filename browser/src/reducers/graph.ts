import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { Graph } from '../../../src/types';

export interface IGraphState {
    hideGraph?: boolean;
    width?: string;
    height?: number;
    itemHeight?: number;
    updateTick?: number;
    startIndex?: number;
}
const initialState: IGraphState = {};

export default handleActions<IGraphState, any>(
    {
        [Actions.COMMITS_RENDERED]: (state, action: ReduxActions.Action<Graph>) => {
            return {
                ...state,
                ...action.payload,
                updateTick: new Date().getTime(),
            } as IGraphState;
        },
    },
    initialState,
);
