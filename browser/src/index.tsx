import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';
import * as querystring from 'query-string';

import App from './containers/App';
import configureStore from './store';

let logEntries: ILogEntry[] = [
  {
    author: { date: new Date(), email: '1don.jayamanne@yahoo.com', localisedDate: '1testing date', name: '1Don Jayamanne' },
    sha1: { full: '12341234123412342424', short: '1234' },
    subject: '1subject'
  } as ILogEntry,
  {
    author: { date: new Date(), email: '2don.jayamanne@yahoo.com', localisedDate: '2testing date', name: '2Don Jayamanne' },
    sha1: { full: '1234123412341234242423', short: '1234' },
    subject: '2subject'
  } as ILogEntry
];


const store = configureStore({ results: logEntries, settings: {} });
const history = syncHistoryWithStore(browserHistory, store);

let query = querystring.parse(window.location.href);
let stylePath = (query.theme && query.theme.indexOf('light')) >= 0 ? 'color-theme-light.css' : 'color-theme-dark.css';

ReactDOM.render(
  <div>
    <link rel='stylesheet' type='text/css' href={stylePath} />
    <Provider store={store}>
      <Router history={history}>
        <Route path='/' component={App}>
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('root')
);
