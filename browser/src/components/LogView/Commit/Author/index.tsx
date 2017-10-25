import * as React from 'react';
import { ActionedDetails } from '../../../../definitions';
import { RootState } from '../../../../reducers/index';
import { connect } from 'react-redux';
// tslint:disable-next-line:no-require-imports no-var-requires
const GoX = require('react-icons/lib/go/x');

interface AuthorProps {
  result: ActionedDetails;
  locale: string;
}

function Author(props: AuthorProps) {
  return (<div className='commit-author'>
    <span className='name hint--right hint--rounded hint--bounce' aria-label={props.result.email}>{props.result.name}</span>
    <span className='timestamp'> on x{props.locale}y {props.result.date!}</span>
  </div>);
}

// function formatDate(date: Date) {
//   const lang = process.env.language;
//   const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
//   return date.toLocaleString(lang, dateOptions);
// }

function mapStateToProps(state: RootState, wrapper: { result: ActionedDetails }) {
  return {
    result: wrapper.result,
    locale: state.vscode.locale
  };
}

// function mapDispatchToProps(dispatch) {
//   return {
//     // ...bindActionCreators({ ...ResultActions }, dispatch),
//     // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
//     setSize: (size: Size) => dispatch(ResultActions.logViewSizeCalculated(size)),
//     setHeight: (height: number) => dispatch(ResultActions.logEntryHeightCalculated(height)),
//     commitsRendered: () => dispatch(ResultActions.commitsRendered()),
//     onViewCommit: (hash: string) => dispatch(ResultActions.viewCommit(hash)),
//     onCherryPick: (logEntry: LogEntry) => dispatch(ResultActions.cherryPickCommit(logEntry)),
//     actionACommit: (logEntry: LogEntry) => dispatch(ResultActions.actionACommit(logEntry))
//   };
// }

export default connect(
  mapStateToProps
)(Author);