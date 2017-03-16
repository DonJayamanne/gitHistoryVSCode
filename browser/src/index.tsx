import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';
import * as querystring from 'query-string';

import App from './containers/App';
import configureStore from './store';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

let query = querystring.parse(window.location.href);
// if (query.color && query.color.length > 0) {
//   window.document.body.style.color = (query.color as string);
// }
// if (query.backgroundcolor && query.backgroundcolor.length > 0) {
//   window.document.body.style.backgroundColor = (query.backgroundcolor as string);
// }
// if (query.fontFamily && query.fontFamily.length > 0) {
//   window.document.body.style.fontFamily = (query.fontFamily as string);
// }
// if (query.fontSize && query.fontSize.length > 0) {
//   window.document.body.style.fontSize = (query.fontSize as string);
// }
// if (query.fontfamily && query.fontfamily.length > 0) {
//   window.document.body.style.fontFamily = (query.fontfamily as string);
// }
// if (query.fontweight && query.fontweight.length > 0) {
//   window.document.body.style.fontWeight = (query.fontweight as string);
// }

let stylePath = (query.theme && query.theme.indexOf('light')) >= 0 ? 'color-theme-light.css' : 'color-theme-dark.css';

ReactDOM.render(
  <div>
    <link rel="stylesheet" type="text/css" href={stylePath} />
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('root')
);
