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
  [Actions.LOGENTRY_ITEM_HEIGHT_CALCULATED]: (state, action: ReduxActions.Action<number>) => {
    return { ...state, itemHeight: action.payload } as IGraphState;
  },
  [Actions.COMMITS_RENDERED]: (state, action: any) => {
    return { ...state, updateTick: new Date().getTime() } as IGraphState;
  },
}, initialState);
