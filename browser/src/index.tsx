import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as ResultActions from './actions/results';
import App from './containers/App';
import { ISettings } from './definitions';
// tslint:disable-next-line:import-name
import configureStore from './store';

const defaultSettings: ISettings = window['settings'];

// tslint:disable-next-line:no-any
const store = configureStore({ 
    settings: defaultSettings, 
    searchCriteria: {}, graph: {}, 
    vscode: { theme: document.body.className, locale: window['locale'], configuration: window['configuration'] } });

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Router>
                <Route component={App}>
                </Route>
            </Router>
        </Provider>
    </div>,
    document.getElementById('root')
);

store.dispatch(ResultActions.getCommits(defaultSettings.id));
store.dispatch(ResultActions.getBranches());
store.dispatch(ResultActions.getAuthors());
