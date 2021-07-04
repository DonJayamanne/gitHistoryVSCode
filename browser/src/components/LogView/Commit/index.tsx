import * as React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { CommittedFile, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import Author from './Author';
import Avatar from './Avatar';
import { FileEntry } from './FileEntry';
import { GoX, GoClippy } from 'react-icons/go';
import { ResultActions } from '../../../actions/results';
import { gitmojify } from '../gitmojify';

interface CommitProps {
    selectedEntry?: LogEntry;
    theme: string;
    closeCommitView: typeof ResultActions.closeCommitView;
    actionFile: typeof ResultActions.actionFile;
}

interface CommitState {
    searchText: string;
}

class Commit extends React.Component<CommitProps, CommitState> {
    private ref: HTMLInputElement;
    constructor(props: CommitProps) {
        super(props);
        this.state = { searchText: '' };
    }

    public componentDidUpdate(prevProps: CommitProps) {
        if (
            prevProps.selectedEntry &&
            this.props.selectedEntry &&
            this.props.selectedEntry !== prevProps.selectedEntry
        ) {
            this.setState({ searchText: '' });
        }

        this.ref.focus();
    }

    public componentDidMount() {
        this.setState({ searchText: '' });
    }

    private onActionFile = (fileEntry: CommittedFile, name) => {
        this.props.actionFile(this.props.selectedEntry, fileEntry, name);
    };
    private onClose = () => {
        this.props.closeCommitView();
    };
    private renderFileEntries() {
        if (this.state.searchText) {
            return this.props.selectedEntry.committedFiles
                .filter(x => x.relativePath.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1)
                .map((fileEntry, index) => (
                    <FileEntry
                        theme={this.props.theme}
                        committedFile={fileEntry}
                        key={index + fileEntry.relativePath}
                        onAction={this.onActionFile}
                    />
                ));
        } else {
            return this.props.selectedEntry.committedFiles.map((fileEntry, index) => (
                <FileEntry
                    theme={this.props.theme}
                    committedFile={fileEntry}
                    key={index + fileEntry.relativePath}
                    onAction={this.onActionFile}
                />
            ));
        }
    }
    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchText: e.target.value });
    };
    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && !this.state.searchText) {
            // close commit view when ESC is pressen (but only when no text given)
            this.onClose();
            return;
        }

        if (e.key === 'Escape') {
            this.setState({ searchText: '' });
        }
    };
    public render() {
        return (
            <div id="detail-view">
                <div className="authorAndCommitInfoContainer">
                    <div style={{ minWidth: '80px' }}>
                        <Avatar result={this.props.selectedEntry.author}></Avatar>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <h1 className="commit-subject">
                            {gitmojify(this.props.selectedEntry.subject)}
                            &nbsp;
                            <CopyToClipboard
                                text={this.props.selectedEntry.subject + '\n' + this.props.selectedEntry.body}
                            >
                                <span
                                    className="btnx clipboard hint--right hint--rounded hint--bounce"
                                    aria-label="Copy commit text"
                                >
                                    <GoClippy></GoClippy>
                                </span>
                            </CopyToClipboard>
                        </h1>
                        <Author result={this.props.selectedEntry.author}></Author>
                        <div className="commit-body">{gitmojify(this.props.selectedEntry.body)}</div>
                        <div className="commit-notes">{gitmojify(this.props.selectedEntry.notes)}</div>
                    </div>
                    <div className="actions">
                        <input
                            ref={x => {
                                this.ref = x;
                            }}
                            className={'textInput'}
                            type="text"
                            value={this.state.searchText}
                            placeholder="Find file"
                            onKeyDown={this.handleKeyDown}
                            onChange={this.handleSearchChange}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-default hint--bottom-left hint--rounded hint--bounce"
                            aria-label="Close the detail view"
                            onClick={this.onClose}
                        >
                            <GoX />
                        </button>
                    </div>
                </div>
                <div className="comitted-files">{this.renderFileEntries()}</div>
            </div>
        );
    }
}

function mapStateToProps(state: RootState) {
    if (state.logEntries) {
        return {
            selectedEntry: state.logEntries.selected,
            theme: state.vscode.theme,
        } as CommitProps;
    }
    return {
        selectedEntry: undefined,
        theme: state.vscode.theme,
    } as CommitProps;
}

function mapDispatchToProps(dispatch) {
    return {
        closeCommitView: () => dispatch(ResultActions.closeCommitView()),
        actionFile: (logEntry: LogEntry, committedFile: CommittedFile, name) =>
            dispatch(ResultActions.actionFile(logEntry, committedFile, name)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Commit);
