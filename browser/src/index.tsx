import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './containers/App';
import { ISettings } from './definitions';
import configureStore from './store';

const defaultSettings: ISettings = window['settings'];

const store = configureStore({
    settings: defaultSettings,
    graph: null,
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
