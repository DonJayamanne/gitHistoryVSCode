import * as React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../../reducers';
import * as ResultActions from '../../../actions/results';
import Header from '../../../components/Header';
import LogEntryList from '../LogEntryList';
import * as style from './style.css';
import axios from 'axios';
import { Branch, BranchType, ISettings, LogEntries, LogEntry } from '../../../definitions';
import * as jQuery from 'jquery';
import BranchGraph from '../BranchGraph';
import Scroll from 'react-scroll';

type Size = { height: string, width: string };
type LogViewProps = {
  logEntries: LogEntries;
  setSize: typeof ResultActions.logViewSizeCalculated;
  setHeight: typeof ResultActions.logEntryHeightCalculated;
  commitsRendered: typeof ResultActions.commitsRendered;
  onViewCommit: typeof ResultActions.viewCommit;
};

interface LogViewState {
}


class LogView extends React.Component<LogViewProps, LogViewState> {
  constructor(props?: LogViewProps, context?: any) {
    super(props, context);
    // this.state = { height: '', width: '', itemHeight: 0 };
  }
  private calculatedHeight: string;
  private calculatedWidth: string;
  private calculatedItemHeight: number;
  componentDidUpdate() {
    // const $ref = jQuery(this.ref);
    const $ref = jQuery(this.ref.children[1]);
    const height = $ref.outerHeight().toString();
    const width = $ref.outerWidth().toString();
    const $logEntry = jQuery('.log-entry').filter(':first');
    const logEntryHeight = $logEntry.outerHeight() + parseFloat($logEntry.css('marginTop'));

    if (!isNaN(logEntryHeight) && (!this.state || this.calculatedHeight !== height ||
      this.calculatedItemHeight !== logEntryHeight || this.calculatedWidth !== width)) {
      console.log(`${height}, ${width}, ${logEntryHeight}`);
      // this.setState({ height, width, itemHeight: logEntryHeight, commitsUpdatedTime: new Date().getTime() });
      this.props.setHeight(logEntryHeight);
      this.props.setSize({ height, width });
      this.props.commitsRendered();
      return;
    }

    if (!isNaN(logEntryHeight) && this.props.logEntries &&
      this.calculatedItemHeight > 0 &&
      Array.isArray(this.props.logEntries.items) && this.props.logEntries.items.length > 0) {
      this.props.commitsRendered();
    }
  }

  private ref: HTMLDivElement;
  onViewCommit(logEntry: LogEntry) {
    console.log(logEntry);
    console.log('Selected');
    this.props.onViewCommit(logEntry.hash.full);
  }
  onClick(entry: LogEntry) {
    console.log(entry);
    console.log('Click');
  }
  onCherryPickCommit(entry: LogEntry) {
    console.log(entry);
    console.log('Cherry Pick');
  }

  render() {
    return (
      <div className='log-view' id='scrollCnt' ref={(ref) => this.ref = ref}>
        <BranchGraph ></BranchGraph>
        {/* <BranchGraph logEntries={this.props.logEntries.items}
          height={this.state.height}
          width={this.state.width}
          itemHeight={this.state.itemHeight}
          commitsUpdatedTime={this.state.commitsUpdatedTime} ></BranchGraph> */}
        <LogEntryList logEntries={this.props.logEntries.items}
          onCherryPick={this.onCherryPickCommit.bind(this)}
          onClick={this.onClick.bind(this)}
          onViewCommit={this.onViewCommit.bind(this)}></LogEntryList>
      </div>
    );
  }
}
function mapStateToProps(state: RootState, wrapper: { logEntries: LogEntries }) {
  return {
    logEntries: wrapper.logEntries
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators({ ...ResultActions }, dispatch),
    // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
    setSize: (size: Size) => dispatch(ResultActions.logViewSizeCalculated(size)),
    setHeight: (height: number) => dispatch(ResultActions.logEntryHeightCalculated(height)),
    commitsRendered: () => dispatch(ResultActions.commitsRendered()),
    onViewCommit: (hash: string) => dispatch(ResultActions.viewCommit(hash))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogView);
