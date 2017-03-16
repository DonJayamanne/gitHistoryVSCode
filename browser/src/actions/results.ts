import { createAction } from 'redux-actions';
import * as Actions from '../constants/resultActions';

export const clearResults = createAction<void>(Actions.CLEAR_RESULTS);
export const addResult = createAction<NotebookOutput>(Actions.ADD_RESULT);
export const addResults = createAction<NotebookOutput[]>(Actions.ADD_RESULTS);
export const setAppendResults = createAction<boolean>(Actions.SET_APPEND_RESULTS);
