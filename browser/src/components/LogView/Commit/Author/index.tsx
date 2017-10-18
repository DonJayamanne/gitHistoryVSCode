import * as React from 'react';
import { ActionedDetails } from '../../../../definitions';
import { RootState } from '../../../../reducers/index';
// tslint:disable-next-line:no-require-imports no-var-requires
const GoX = require('react-icons/lib/go/x');

interface AuthorProps {
  result: ActionedDetails;
}

export default function Author(props: AuthorProps) {
  return (<div className='commit-author'>
    <span className='name hint--right hint--rounded hint--bounce' aria-label={props.result.email}>{props.result.name}</span>
    <span className='timestamp'> on {props.result.date!}</span>
  </div>);
}

// function formatDate(date: Date) {
//   const lang = process.env.language;
//   const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
//   return date.toLocaleString(lang, dateOptions);
// }


// function mapStateToProps(state: RootState) {
//   return {
//     locale: state.locale
//   } as CommitProps;
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     closeCommitView: () => dispatch(ResultActions.closeCommitView()),
//     selectCommittedFile: (logEntry: LogEntry, committedFile: CommittedFile) => dispatch(ResultActions.selectCommittedFile(logEntry, committedFile))
//   };
// }

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(Commit);
