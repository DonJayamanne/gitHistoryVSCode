import { LogEntry, LogEntries } from '../definitions';
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
  // [Actions.CLEAR_RESULTS]: (state, action) => {
  //   return { ...state, logEntries: undefined } as IGraphState;
  // },
  // [Actions.ADD_RESULTS]: (state, action: ReduxActions.Action<LogEntries>) => {
  //   return { ...state, logEntries: action.payload } as IGraphState;
  // },
  [Actions.LOGENTRY_ITEM_HEIGHT_CALCULATED]: (state, action: ReduxActions.Action<number>) => {
    return { ...state, itemHeight: action.payload } as IGraphState;
  },
  [Actions.UPDATE_GRAPH]: (state, action: any) => {
    return { ...state, updateTick: new Date().getTime() } as IGraphState;
  },
  [Actions.LOGVIEW_SIZE_CALCULATED]: (state, action: ReduxActions.Action<{ height: string, widht: string }>) => {
    return { ...state, ...action.payload } as IGraphState;
  }
}, initialState);
