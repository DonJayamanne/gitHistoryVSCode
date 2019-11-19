import * as querystring from 'query-string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as ResultActions from './actions/results';
import App from './containers/App';
import { ISettings } from './definitions';
// tslint:disable-next-line:import-name
import configureStore from './store';
import { BranchSelection } from './types';

const query = querystring.parse(window.location.href);

const defaultSettings: ISettings = {};
defaultSettings.id = (query.id || '').toString();
defaultSettings.selectedBranchName = typeof query.branchName === 'string' ? (query.branchName as string) : undefined;
defaultSettings.file = typeof query.file === 'string' ? (query.file as string) : undefined;
const num = parseInt((query.branchSelection || '-1').toString(), 10);
defaultSettings.selectedBranchType = (num === -1) ? undefined : num as BranchSelection;

const locale = (query.locale || '').toString();
// tslint:disable-next-line:no-any
const store = configureStore({ 
    settings: defaultSettings, 
    searchCriteria: {}, graph: {}, 
    vscode: { theme: query.theme as any, locale, configuration: window['configuration'] } });

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Router>
                <Route path='/' component={App}>
                </Route>
            </Router>
        </Provider>
    </div>,
    document.getElementById('root')
);

store.dispatch(ResultActions.getCommits(defaultSettings.id));
store.dispatch(ResultActions.getBranches());
store.dispatch(ResultActions.getAuthors());
