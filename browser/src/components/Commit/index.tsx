import { IClassRequirementDescriptor } from 'tslint/lib/rules/completedDocsRule';
import * as React from 'react';
import Author from '../Author';
import CommitFile from '../CommitFile';
import Author from '../Author';
const GoX = require('react-icons/lib/go/x');

interface CommitProps {
  result: ILogEntry;
  onSelect: (ILogEntry) => void;

}

interface CommitState {
  /* empty */
}

class Commit extends React.Component<CommitProps, CommitState> {
  render() {
    return <div>
      <a className='close-btn'><GoX></GoX></a>
      <h1 className='commit-subject'>{this.props.result.subject}</h1>
      <Author result={this.props.result.author}></Author>
      <div className='commit-body'>{this.props.result.body}</div>
      <div className='commit-notes'>{this.props.result.notes}</div>
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
      </ul >
    </div >;
  }
}

export default Commit;
