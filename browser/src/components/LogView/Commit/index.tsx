import { RootState } from '../../../reducers';
import { LogEntry, CommittedFile } from '../../../definitions';
import * as React from 'react';
import { connect } from 'react-redux';
import Author from './Author';
import { FileEntry } from './FileEntry';
const GoX = require('react-icons/lib/go/x');
import Rnd from 'react-rnd';
import { Direction } from 'react-rnd';
import * as ResultActions from '../../../actions/results';
import * as jQuery from 'jquery';

interface CommitProps {
  selectedEntry?: LogEntry;
  theme: string;
  closeCommitView: typeof ResultActions.closeCommitView;
  selectCommittedFile: typeof ResultActions.selectCommittedFile;
}

// const ContainerStyle = { width: '50%' };
const ContainerStyle = {
  width: '100vw',
  height: '100vh'
};

class Commit extends React.Component<CommitProps> {
  componentDidUpdate() {
    if (this.props && this.props.selectedEntry) {
      this.resize();
    }
    else {
      jQuery('#placeHolderCommit').hide();
    }
  }
  componentWillUnmount() {
    jQuery('#placeHolderCommit').hide();
  }
  private resize() {
    const $ref = jQuery('.react-draggable');
    const height = $ref.height();
    const newHeight = (height + 40) + 'px';

    jQuery('#placeHolderCommit').css('padding-top', height / 2).css('padding-bottom', (height / 2) + 10).show();
  }
  private ref: HTMLElement;
  onSelectFile = (fileEntry: CommittedFile) => {
    this.props.selectCommittedFile(this.props.selectedEntry, fileEntry);
  }
  onClose = () => {
    this.props.closeCommitView();
  }
  private renderFileEntries() {
    return this.props.selectedEntry.committedFiles
      .map((fileEntry, index) => <FileEntry theme={this.props.theme} committedFile={fileEntry} key={index + fileEntry.relativePath} onSelect={this.onSelectFile} />);
  }

  onResize = (_, direction: Direction, ref: HTMLElement, delta: number) => {
    const $ref = jQuery(ref);
    const height = $ref.height();
    const padding = height / 2;
    jQuery('#placeHolderCommit').show().css('padding-top', padding).css('padding-bottom', padding);
  }
  render() {
    if (!this.props.selectedEntry) {
      jQuery('#placeHolderCommit').hide();
      return null;
    }

    const resizing = { top: true, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false };

    return (
      <Rnd className='details-view-cnt' ref={ref => this.ref = ref} default={ContainerStyle} minWidth={50} minHeight={50} bounds='parent'
        onResize={this.onResize} onResizeStart={this.onResize} enableResizing={resizing} disableDragging={true}>
        <div id='details-view'>
          <a className='action-btn close-btn' onClick={this.onClose}><GoX></GoX></a>
          <h1 className='commit-subject'>{this.props.selectedEntry.subject}</h1>
          <Author result={this.props.selectedEntry.author}></Author>
          <div className='commit-body'>{this.props.selectedEntry.body}</div>
          <div className='commit-notes'>{this.props.selectedEntry.notes}</div>
          <ul className='committed-files'>
            {this.renderFileEntries()}
          </ul>
        </div>
      </Rnd >);
  }
}

function mapStateToProps(state: RootState) {
  if (state.logEntries) {
    return {
      selectedEntry: state.logEntries.selected,
      theme: state.vscode.theme
    } as CommitProps;
  }
  return {
    selectedEntry: undefined,
    theme: state.vscode.theme
  } as CommitProps;
}

function mapDispatchToProps(dispatch) {
  return {
    closeCommitView: () => dispatch(ResultActions.closeCommitView()),
    selectCommittedFile: (logEntry: LogEntry, committedFile: CommittedFile) => dispatch(ResultActions.selectCommittedFile(logEntry, committedFile))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Commit);
