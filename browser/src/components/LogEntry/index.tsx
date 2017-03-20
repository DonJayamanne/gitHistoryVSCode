import { IClassRequirementDescriptor } from 'tslint/lib/rules/completedDocsRule';
import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
const GoClippy = require('react-icons/lib/go/clippy');

interface ResultListProps {
  result: ILogEntry;
  onSelect: (ILogEntry) => void;

}

interface ResultListState {
  /* empty */
}

class ResultList extends React.Component<ResultListProps, ResultListState> {
  render() {
    return <div className='log-entry'>
      <div className='media right'>
        <div className='media-image'>
          <div className='commit-hash-container'>
            <CopyToClipboard text={this.props.result.sha1.full}>
              <div className='copy-button'>
                <span className='btn clipboard hint--bottom hint--rounded hint--bounce'
                  aria-label='Copy the full SHA'>
                  <GoClippy></GoClippy>
                </span>
              </div>
            </CopyToClipboard>
            <div className='commit-hash' onClick={() => this.props.onSelect(this.props.result)}>
              <span className='sha-code short' data-entry-index='1' aria-label={this.props.result.sha1.short}>{this.props.result.sha1.short}</span>
            </div>
          </div>
        </div>
        <div className='media-content' onClick={() => this.props.onSelect(this.props.result)}>
          <a className='commit-subject-link'>{this.props.result.subject}</a>
          <div className='commit-subject' data-entry-index='1'>{this.props.result.subject}</div>
          <div className='commit-author'>
            <span className='name hint--right hint--rounded hint--bounce' aria-label={this.props.result.author.email}>{this.props.result.author.name}</span>
            <span className='timestamp'>on {this.props.result.author.localisedDate}</span>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default ResultList;
