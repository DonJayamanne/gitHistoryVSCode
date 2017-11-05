import * as React from 'react';
import { connect } from 'react-redux';
import { CommittedFile, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import Author from './Author';
import { FileEntry } from './FileEntry';
// tslint:disable-next-line:no-require-imports no-var-requires
const GoX = require('react-icons/lib/go/x');
import * as jQuery from 'jquery';
import Rnd from 'react-rnd';
import { Direction } from 'react-rnd';
import * as ResultActions from '../../../actions/results';
import { gitmojify } from '../gitmojify';

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
    public componentDidUpdate() {
        if (this.props && this.props.selectedEntry) {
            setTimeout(this.resize.bind(this), 1);
        }
        else {
            jQuery('#placeHolderCommit').hide();
        }
    }
    public componentDidMount() {
        if (this.props && this.props.selectedEntry) {
            setTimeout(this.resize.bind(this), 1);
        }
    }
    public componentWillUnmount() {
        jQuery('#placeHolderCommit').hide();
    }
    private resize() {
        const $ref = jQuery('.react-draggable');
        $ref.removeClass('hidden').css('top', '');
        jQuery('#details-view').removeClass('hidden');
        const height = $ref.height();

        jQuery('#placeHolderCommit').css('padding-top', height / 2).css('padding-bottom', (height / 2) + 10).show();
    }
    private ref: HTMLElement;
    private onSelectFile = (fileEntry: CommittedFile) => {
        this.props.selectCommittedFile(this.props.selectedEntry, fileEntry);
    }
    private onClose = () => {
        this.props.closeCommitView();
    }
    private renderFileEntries() {
        return this.props.selectedEntry.committedFiles
            .map((fileEntry, index) => <FileEntry theme={this.props.theme} committedFile={fileEntry} key={index + fileEntry.relativePath} onSelect={this.onSelectFile} />);
    }

    private onResize = (_, direction: Direction, ref: HTMLElement, delta: number) => {
        const $ref = jQuery(ref);
        const height = $ref.height();
        const padding = height / 2;
        jQuery('#placeHolderCommit').show().css('padding-top', padding).css('padding-bottom', padding);
    }
    public render() {
        if (!this.props.selectedEntry) {
            jQuery('#placeHolderCommit').hide();
            return null;
        }

        const resizing = { top: true, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false };

        return (
            // tslint:disable-next-line:react-this-binding-issue
            <Rnd className='details-view-cnt hidden' ref={ref => this.ref = ref} default={ContainerStyle} minWidth={50} minHeight={50} bounds='parent'
                onResize={this.onResize} onResizeStart={this.onResize} enableResizing={resizing} disableDragging={true}>
                <div className='detailsCnt'>
                    <div id='details-view' className='hidden' >
                        <a role='button' className='action-btn close-btn' onClick={this.onClose}><GoX></GoX></a>
                        <h1 className='commit-subject'>{gitmojify(this.props.selectedEntry.subject)}</h1>
                        <Author result={this.props.selectedEntry.author}></Author>
                        <div className='commit-body'>{gitmojify(this.props.selectedEntry.body)}</div>
                        <div className='commit-notes'>{gitmojify(this.props.selectedEntry.notes)}</div>
                        {this.renderFileEntries()}
                        <ul className='committed-files'>
                        </ul>
                    </div>
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
