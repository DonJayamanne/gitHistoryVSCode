import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { BranchesState } from './';

const initialState: BranchesState = [];

// tslint:disable-next-line:no-any
export default handleActions<BranchesState, any>({
    [Actions.FETCHED_BRANCHES]: (state, action: ReduxActions.Action<BranchesState>) => {
        return [
            ...action.payload
        ];
    },

    [Actions.IS_FETCHING_BRANCHES]: (state, action) => {
        return [...state];
    },

    [Actions.FETCH_BRANCHES]: (state, action: ReduxActions.Action<void>) => {
        return [...state];
    },
}, initialState);
