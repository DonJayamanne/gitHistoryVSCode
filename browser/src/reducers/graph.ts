import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';

export interface IGraphState {
  height?: string;
  width?: string;
  itemHeight?: number;
  updateTick?: number;
}
const initialState: IGraphState = {};

export default handleActions<IGraphState, any>({
  [Actions.COMMITS_RENDERED]: (state, action: ReduxActions.Action<number>) => {
    return { ...state, updateTick: new Date().getTime(), itemHeight: action.payload } as IGraphState;
  },
}, initialState);
