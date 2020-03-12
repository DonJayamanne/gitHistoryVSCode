import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { AuthorsState } from './';

const initialState: AuthorsState = [];

export default handleActions<AuthorsState, any>(
    {
        [Actions.FETCHED_AUTHORS]: (state, action: ReduxActions.Action<AuthorsState>) => {
            return [...action.payload];
        },
    },
    initialState,
);
