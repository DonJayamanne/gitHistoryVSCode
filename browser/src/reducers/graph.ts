import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { Graph } from '../../../src/types';

export default handleActions<Graph, any>(
    {
        [Actions.COMMITS_RENDERED]: (state, action: ReduxActions.Action<Graph>) => {
            return action.payload;
        },
    },
    null,
);
