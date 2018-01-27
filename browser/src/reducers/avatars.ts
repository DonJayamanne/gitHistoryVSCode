import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import { Avatar } from '../definitions';
import { AvatarsState } from './index';

const initialState: AvatarsState = [];

// tslint:disable-next-line:no-any
export default handleActions<AvatarsState, any>({
    [Actions.FETCHED_AVATARS]: (state, action: ReduxActions.Action<Avatar[]>) => {
        return [
            ...state,
            ...action.payload
        ];
    }
}, initialState);
