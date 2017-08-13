import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';

export const clearResults = createAction(Actions.CLEAR_RESULTS);
export const addResult = createAction<any>(Actions.ADD_RESULT);
export const addResults = createAction<ILogEntry[]>(Actions.ADD_RESULTS);
export const setAppendResults = createAction<boolean>(Actions.SET_APPEND_RESULTS);
