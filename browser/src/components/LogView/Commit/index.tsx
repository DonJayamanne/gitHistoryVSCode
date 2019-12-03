import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { CommittedFile, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import Author from './Author';
import Avatar from './Avatar';
import { FileEntry } from './FileEntry';
import { GoX, GoClippy } from 'react-icons/lib/go';
import Rnd from 'react-rnd';
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
        // componentDidUpdate
    }

    public componentDidMount() {
        // componentDidMount
    }
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
    public render() {
        const resizing = { top: true, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false };

        return (
            // tslint:disable-next-line:react-this-binding-issue
            <Rnd className='details-view-cnt' default={ContainerStyle} minWidth={50} minHeight={50} maxHeight='50%' bounds='parent'
                enableResizing={resizing}  disableDragging={this.props.selectedEntry !== undefined}>
                <div className='detailsCnt'>
                    <div id='details-view' >
                        <a role='button' className='action-btn close-btn' onClick={this.onClose}><GoX></GoX></a>
                        <div className='authorAndCommitInfoContainer'>
                            <Avatar result={this.props.selectedEntry.author}></Avatar>
                            <h1 className='commit-subject'>
                                {gitmojify(this.props.selectedEntry.subject)}
                                &nbsp;
                                <CopyToClipboard text={this.props.selectedEntry.subject + "\n" + this.props.selectedEntry.body}>
                                    <span className='btnx clipboard hint--right hint--rounded hint--bounce' aria-label='Copy commit text'>
                                        <GoClippy></GoClippy>
                                    </span>
                                </CopyToClipboard>
                            </h1>
                            <Author result={this.props.selectedEntry.author}></Author>
                            <div className='commit-body'>{gitmojify(this.props.selectedEntry.body)}</div>
                            <div className='commit-notes'>{gitmojify(this.props.selectedEntry.notes)}</div>
                        </div>
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
