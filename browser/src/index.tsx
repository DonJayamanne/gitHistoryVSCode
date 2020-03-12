import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ResultActions } from './actions/results';
import { initialize } from './actions/messagebus';
import App from './containers/App';
import { ISettings } from './definitions';
import configureStore from './store';

const defaultSettings: ISettings = window['settings'];

const store = configureStore({
    settings: defaultSettings,
    graph: {},
    vscode: {
        theme: document.body.className,
        locale: window['locale'],
        configuration: window['configuration'],
    },
});

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Router>
                <Route component={App}></Route>
            </Router>
        </Provider>
    </div>,
    document.getElementById('root'),
);

initialize(window['vscode']);

store.dispatch<any>(ResultActions.getCommits());
store.dispatch<any>(ResultActions.getBranches());
store.dispatch<any>(ResultActions.getAuthors());
store.dispatch<any>(ResultActions.fetchAvatars());
