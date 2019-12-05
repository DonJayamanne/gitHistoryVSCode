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

interface CommitState {
    searchText: string;
}


// const ContainerStyle = { width: '50%' };
const ContainerStyle = {
    width: '100vw',
    height: '100vh'
};

class Commit extends React.Component<CommitProps, CommitState> {
    private ref: HTMLInputElement;
    constructor(props: CommitProps) {
        super(props);
        this.state = { searchText: ''};
    }

    public componentDidUpdate() {
        // componentDidUpdate
        this.ref.focus();
    }

    public componentDidMount() {
        // componentDidMount
        this.setState({ searchText: '' });
    }

    componentWillReceiveProps(nextProps: CommitProps): void {
        this.setState({ searchText: '' });
    }

    private onSelectFile = (fileEntry: CommittedFile) => {
        this.props.selectCommittedFile(this.props.selectedEntry, fileEntry);
    }
    private onClose = () => {
        this.props.closeCommitView();
    }
    private renderFileEntries() {
        if (this.state.searchText) {
            return this.props.selectedEntry.committedFiles.filter(x => x.relativePath.indexOf(this.state.searchText) !== -1)
            .map((fileEntry, index) => <FileEntry theme={this.props.theme} committedFile={fileEntry} key={index + fileEntry.relativePath} onSelect={this.onSelectFile} />);
        } else {
            return this.props.selectedEntry.committedFiles
            .map((fileEntry, index) => <FileEntry theme={this.props.theme} committedFile={fileEntry} key={index + fileEntry.relativePath} onSelect={this.onSelectFile} />);
        }
    }
    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchText: e.target.value });
    }
    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            this.setState({ searchText: '' });
        }
    }
    public render() {
        const resizing = { top: true, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false };

        return (
            // tslint:disable-next-line:react-this-binding-issue
            <Rnd className='details-view-cnt' default={ContainerStyle} minWidth={50} minHeight={50} maxHeight='50%' bounds='parent'
                enableResizing={resizing}  disableDragging={this.props.selectedEntry !== undefined}>
                <div id='details-view'>
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
                </div>
                <div id="comitted-files">
                    <div>
                        <input ref={x => {this.ref = x;} } className={'textInput'} type="text" value={this.state.searchText} placeholder="Find file" onKeyDown={this.handleKeyDown} onChange={this.handleSearchChange} />
                    </div>
                    {this.renderFileEntries()}
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
