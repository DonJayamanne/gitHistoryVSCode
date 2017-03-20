import { routerReducer as routing, RouteActions } from 'react-router-redux';
import { combineReducers, Reducer } from 'redux';
import results from './results';
import settings from './settings';

export interface RootState {
  results: ILogEntry[];
  settings: any;
}

export default combineReducers<RootState>({
  routing,
  results,
  settings
});
