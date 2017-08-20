import { debug } from 'util';
import * as React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { LogEntriesState, RootState } from '../../reducers';
import * as ResultActions from '../../actions/results';
import Header from '../../components/Header';
import LogEntryList from '../../components/LogView/LogEntryList';
import * as style from './style.css';
import axios from 'axios';
import { Branch, BranchType, ISettings, LogEntries, LogEntry } from '../../definitions';
import LogView from '../../components/LogView/LogView';
import Footer from '../../components/Footer';

type AppProps = {
  settings: ISettings;
  logEntries: LogEntriesState;
  getCommits: typeof ResultActions.getCommits;
  getPreviousCommits: typeof ResultActions.getPreviousCommits;
  getNextCommits: typeof ResultActions.getNextCommits;
} & typeof ResultActions;

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState> {
  constructor(props?: AppProps, context?: any) {
    super(props, context);
    this.state = { currentPageIndex: 0 };
  }
  componentWillMount() {
  }

  private goBack() {
    this.props.getPreviousCommits();
  }
  private goForward() {
    // this.props.fetchData(this.props.logEntries.pageIndex + 1, this.props.logEntries.pageSize);
    this.props.getNextCommits();
  }
  render() {
    const { children, settings } = this.props;
    return (
      <div className='appRoot'>
        <Header {...this.props }></Header >
        <LogView logEntries={this.props.logEntries}></LogView>
        <Footer
          canGoBack={this.props.logEntries.pageIndex > 0}
          canGoForward={(this.props.logEntries.pageIndex + 1) * 100 < this.props.logEntries.count}
          goBack={() => this.goBack()}
          goForward={() => this.goForward()}></Footer>
        {children}
      </div >
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    settings: state.settings,
    logEntries: state.logEntries
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators({ ...ResultActions }, dispatch),
    getCommits: () => dispatch(ResultActions.getCommits()),
    getNextCommits: () => dispatch(ResultActions.getNextCommits()),
    getPreviousCommits: () => dispatch(ResultActions.getPreviousCommits())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
