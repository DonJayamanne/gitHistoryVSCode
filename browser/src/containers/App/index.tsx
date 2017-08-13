import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../reducers';
import * as ResultActions from '../../actions/results';
import Header from '../../components/Header';
import LogEntryList from '../../components/LogEntryList';
import * as style from './style.css';

import * as io from 'socket.io-client';

type AppProps = {
  settings: any;
  results: any;
} & typeof ResultActions;

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState> {
  private socket: SocketIOClient.Socket;
  constructor(props?: AppProps, context?: any) {
    super(props, context);
    // Use io (object) available in the script
    this.socket = (window as any).io();
    this.socket.on('connect', () => {
      // Do nothing
    });
    this.socket.on('settings.appendResults', (value: any) => {
      console.log('append results');
      this.props.setAppendResults(value);
    });
    this.socket.on('clientExists', (data: any) => {
      this.socket.emit('clientExists', { id: data.id });
    });
    this.socket.on('results', (value: any[]) => {
      if (!this.props.settings.appendResults) {
        console.log('clear results');
        // this.props.clearResults();
      }
      this.socket.emit('results.ack');
      console.log('add results');
      this.props.addResults(value);
    });
  }

  private toggleAppendResults() {
    this.socket.emit('settings.appendResults', !this.props.settings.appendResults);
  }
  private clearResults() {
    this.socket.emit('clearResults');
    this.props.clearResults();
  }

  onSelect(logEntry: ILogEntry) {
    console.log(logEntry);
    console.log('Selectged');
  }
  render() {
    const { children, settings } = this.props;
    return (
      <div>
        <Header
          appendResults={settings.appendResults}
          clearResults={() => this.clearResults()}
          toggleAppendResults={() => this.toggleAppendResults()}>
        </Header>
        <LogEntryList results={this.props.results} onSelect={this.onSelect.bind(this)}></LogEntryList>
        {children}
      </div>
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    settings: state.settings,
    results: state.results
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...ResultActions }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
