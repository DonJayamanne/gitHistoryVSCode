import * as querystring from 'query-string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, Route, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import * as ResultActions from './actions/results';
// (window as any).$ = (window as any).jQuery = require('jquery');
// import 'semantic-ui-css/semantic.min.css';
import App from './containers/App';
import { ISettings, LogEntry } from './definitions';
import configureStore from './store';
import { BranchSelection } from './types';

const query = querystring.parse(window.location.href);
const id = query.id as string;

// Get settings related to this id
const settingsData = window.localStorage.getItem(id);
let defaultSettings: ISettings = {};
defaultSettings.id = (query.id || '').toString();
defaultSettings.selectedBranchName = typeof query.branchName === 'string' ? (query.branchName as string) : undefined;
const num = parseInt((query.branchSelection || '-1').toString(), 10);
defaultSettings.selectedBranchType = (num === -1) ? undefined : num as BranchSelection;
try {
    defaultSettings = settingsData ? JSON.parse(settingsData) : defaultSettings;
}
// tslint:disable-next-line:no-empty
catch (ex) { }

const locale = (query.locale || '').toString();
const store = configureStore({ settings: defaultSettings, searchCriteria: {}, graph: {}, vscode: { theme: query.theme as any, locale } });
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Router history={history}>
                <Route path='/' component={App}>
                </Route>
            </Router>
        </Provider>
    </div>,
    document.getElementById('root')
);

store.dispatch(ResultActions.getCommits(defaultSettings.id));
