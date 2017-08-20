import { RootState } from '../../../reducers';
import { LogEntry } from '../../../definitions';
import * as React from 'react';
import { connect } from 'react-redux';
import Author from './Author';
import CommitFile from './CommitFile';
const GoX = require('react-icons/lib/go/x');
import Rnd from 'react-rnd';
import * as ResultActions from '../../../actions/results';

interface CommitProps {
  selectedEntry?: LogEntry;
  selectCommit: typeof ResultActions.selectCommit;

}

function Commit(props: CommitProps) {
  if (!props.selectedEntry) {
    return null;
  }

  return (
    <Rnd default={{ width: '100%' }}>
      <div id='details-view'>
        <a className='action-btn close-btn' onClick={() => props.selectCommit(null)}><GoX></GoX></a>
        <h1 className='commit-subject'>{props.selectedEntry.subject}</h1>
        <Author result={props.selectedEntry.author}></Author>
        <div className='commit-body'>{props.selectedEntry.body}</div>
        <div className='commit-notes'>{props.selectedEntry.notes}</div>
        <ul className='committed-files'>
          <div className='diff-row'>
            <span className='diff-stats hint--right hint--rounded hint--bounce' aria-label='2 additions & 1 deletion'>
              <span className='diff-count'>3</span>
              <span className='diff-block'></span>
              <span className='diff-block'></span>
              <span className='diff-block'></span>
              <span className='diff-block'></span>
              <span className='diff-block'></span>
            </span>
            <div className='file-name-cnt'>
              <span className='file-name'>resources/iframeContent.ts</span>
              <a className='file-name'>resources/iframeContent.ts</a>
            </div>
          </div>
        </ul>
      </div>
    </Rnd>);
}

function mapStateToProps(state: RootState) {
  if (state.logEntries) {
    return {
      selectedEntry: state.logEntries.selected
    } as CommitProps;
  }
  return {
    selectedEntry: undefined
  } as CommitProps;
}

function mapDispatchToProps(dispatch) {
  return {
    selectCommit: (logEntry: LogEntry) => dispatch(ResultActions.selectCommit(logEntry))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Commit);
