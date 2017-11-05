import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../reducers';
import * as ResultActions from '../../../actions/results';
import LogEntryList from '../LogEntryList';
import { LogEntries, LogEntry } from '../../../definitions';
import * as jQuery from 'jquery';
import BranchGraph from '../BranchGraph';

type Size = { height: string, width: string };
type LogViewProps = {
  logEntries: LogEntries;
  setSize: typeof ResultActions.logViewSizeCalculated;
  setHeight: typeof ResultActions.logEntryHeightCalculated;
  commitsRendered: typeof ResultActions.commitsRendered;
  onViewCommit: typeof ResultActions.selectCommit;
  onCherryPick: typeof ResultActions.cherryPickCommit;
  actionACommit: typeof ResultActions.actionACommit;
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
    this.props.onViewCommit(logEntry.hash.full);
  }
  onClick(entry: LogEntry) {
    console.log(entry);
    console.log('Click');
    this.props.actionACommit(entry);
  }
  onCherryPickCommit(entry: LogEntry) {
    console.log(entry);
    console.log('Cherry Pick in browser');
    this.props.onCherryPick(entry);
  }

  render() {
    return (
      <div className='log-view' id='scrollCnt' ref={(ref) => this.ref = ref}>
        <BranchGraph ></BranchGraph>
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
// function mapStateToProps(state: RootState) {
//   return {
//     logEntries: {
//       items: state.logEntries.items,
//       count: state.logEntries.count
//     }
//   };
// }

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators({ ...ResultActions }, dispatch),
    // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
    setSize: (size: Size) => dispatch(ResultActions.logViewSizeCalculated(size)),
    setHeight: (height: number) => dispatch(ResultActions.logEntryHeightCalculated(height)),
    commitsRendered: () => dispatch(ResultActions.commitsRendered()),
    onViewCommit: (hash: string) => dispatch(ResultActions.selectCommit(hash)),
    onCherryPick: (logEntry: LogEntry) => dispatch(ResultActions.cherryPickCommit(logEntry)),
    actionACommit: (logEntry: LogEntry) => dispatch(ResultActions.actionACommit(logEntry))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogView);
