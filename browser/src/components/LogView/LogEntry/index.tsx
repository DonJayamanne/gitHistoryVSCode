import * as React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { LogEntry, Ref, RefType } from '../../../definitions';
import { RootState } from '../../../reducers/index';
import Author from '../Commit/Author';
import Avatar from '../Commit/Avatar';
import { gitmojify } from '../gitmojify';
import HeadRef from '../Refs/Head';
import RemoteRef from '../Refs/Remote';
import TagRef from '../Refs/Tag';
import { GoGitCommit, GoClippy, GoPlus, GoFileSymlinkFile, GoFileSymlinkDirectory } from 'react-icons/go';

type ResultListProps = {
    logEntry: LogEntry;
    style: any;
    selected?: LogEntry;
    isLoadingCommit?: string;
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
};

class LogEntryView extends React.Component<ResultListProps, {}> {
    constructor(props?: ResultListProps, context?: any) {
        super(props, context);
    }

    private isLoading() {
        if (this.props.logEntry === undefined) return true;
        return this.props.isLoadingCommit === this.props.logEntry!.hash!.full;
    }

    private showLoading() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="#d4d4d4">
                <circle cx="5" cy="5" r="1">
                    <animate
                        attributeName="r"
                        begin="0s"
                        dur="1s"
                        values="1;5;1"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        begin="0s"
                        dur="1s"
                        values=".3;1;.3"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        );
    }

    private getHash(full = false) {
        if (this.props.logEntry === undefined) return '';
        return full ? this.props.logEntry.hash.full : this.props.logEntry.hash.short;
    }

    private renderRemoteRefs() {
        if (this.props.logEntry === undefined) return <span />;
        return this.props.logEntry.refs
            .filter(ref => ref.type === RefType.RemoteHead)
            .map(ref => (
                <RemoteRef
                    key={ref.name}
                    onRemove={() => this.props.onRefAction(this.props.logEntry, ref, 'removeRemote')}
                    {...ref}
                />
            ));
    }

    private renderHeadRef() {
        if (this.props.logEntry === undefined) return <span />;
        return this.props.logEntry.refs
            .filter(ref => ref.type === RefType.Head)
            .map(ref => (
                <HeadRef
                    key={ref.name}
                    onRemove={() => this.props.onRefAction(this.props.logEntry, ref, 'removeBranch')}
                    onAction={name => this.props.onRefAction(this.props.logEntry, ref, name)}
                    {...ref}
                />
            ));
    }

    private renderTagRef() {
        if (this.props.logEntry === undefined) return <span />;
        return this.props.logEntry.refs
            .filter(ref => ref.type === RefType.Tag)
            .map(ref => (
                <TagRef
                    key={ref.name}
                    onRemove={() => this.props.onRefAction(this.props.logEntry, ref, 'removeTag')}
                    {...ref}
                />
            ));
    }

    public render() {
        const isActive =
            this.props.logEntry &&
            this.props.selected &&
            this.props.selected.hash.full === this.props.logEntry.hash.full;
        let cssClassName = `log-entry ${this.props.logEntry.parents.length > 1 ? 'log-entry-gray' : ''}
                                 ${isActive ? 'active' : ''}`;

        if (this.isLoading()) {
            cssClassName += ' loading';
        }
        function handleClickAndPreventPropagation(handler: Function) {
            return function(event: React.MouseEvent<HTMLElement, MouseEvent>) {
                event.preventDefault();
                event.stopPropagation();
                handler();
            };
        }
        function preventPropagation(event: React.MouseEvent<HTMLElement, MouseEvent>) {
            event.preventDefault();
            event.stopPropagation();
        }
        return (
            <div
                className={cssClassName}
                style={this.props.style}
                onClick={() => this.props.onViewCommit(this.props.logEntry)}
            >
                <div className="media right">
                    <div className="media-image">
                        <div className="ref" onClick={preventPropagation}>
                            {this.renderRemoteRefs()}
                            {this.renderHeadRef()}
                            {this.renderTagRef()}
                        </div>
                        <div className="buttons" onClick={() => this.props.onViewCommit(this.props.logEntry)}>
                            <div>
                                <CopyToClipboard text={this.getHash(true)}>
                                    <span
                                        className="btnx hash clipboard hint--top-left hint--rounded hint--bounce"
                                        aria-label="Copy hash to clipboard"
                                    >
                                        {this.getHash()}&nbsp;
                                        <GoClippy></GoClippy>
                                    </span>
                                </CopyToClipboard>
                                &nbsp;
                                <span
                                    role="button"
                                    className="btnx hint--top-left hint--rounded hint--bounce"
                                    aria-label="Soft reset to this commit"
                                >
                                    <a
                                        role="button"
                                        onClick={handleClickAndPreventPropagation(() =>
                                            this.props.onAction(this.props.logEntry, 'reset_soft'),
                                        )}
                                    >
                                        <GoFileSymlinkFile></GoFileSymlinkFile>
                                        Soft
                                    </a>
                                </span>
                                <span
                                    role="button"
                                    className="btnx hint--top-left hint--rounded hint--bounce"
                                    aria-label="Hard reset to this commit"
                                >
                                    <a
                                        role="button"
                                        onClick={handleClickAndPreventPropagation(() =>
                                            this.props.onAction(this.props.logEntry, 'reset_hard'),
                                        )}
                                    >
                                        <GoFileSymlinkDirectory></GoFileSymlinkDirectory>
                                        Hard
                                    </a>
                                </span>
                                <span
                                    role="button"
                                    className="btnx hint--top-left hint--rounded hint--bounce"
                                    aria-label="Create a new tag"
                                >
                                    <a
                                        role="button"
                                        onClick={handleClickAndPreventPropagation(() =>
                                            this.props.onAction(this.props.logEntry, 'newtag'),
                                        )}
                                    >
                                        <GoPlus></GoPlus>Tag
                                    </a>
                                </span>
                                <span
                                    role="button"
                                    className="btnx hint--top-left hint--rounded hint--bounce"
                                    aria-label="Create a new branch from here"
                                >
                                    <a
                                        role="button"
                                        onClick={handleClickAndPreventPropagation(() =>
                                            this.props.onAction(this.props.logEntry, 'newbranch'),
                                        )}
                                    >
                                        <GoPlus></GoPlus>Branch
                                    </a>
                                </span>
                                <span
                                    role="button"
                                    className="btnx hint--top-left hint--rounded hint--bounce"
                                    aria-label="Cherry pick, Compare, etc"
                                >
                                    <a
                                        role="button"
                                        onClick={handleClickAndPreventPropagation(() =>
                                            this.props.onAction(this.props.logEntry, ''),
                                        )}
                                    >
                                        <GoGitCommit></GoGitCommit>More
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div role="button" className="media-content">
                        <div className="commit-subject" title={gitmojify(this.props.logEntry?.subject)}>
                            {gitmojify(this.props.logEntry?.subject)}
                            <span style={{ marginLeft: '.5em' }}>{this.isLoading() ? this.showLoading() : ''}</span>
                        </div>
                        <Avatar result={this.props.logEntry?.author}></Avatar>
                        <Author result={this.props.logEntry?.author}></Author>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: RootState, wrapper: ResultListProps): ResultListProps {
    return {
        ...wrapper,
        isLoadingCommit: state.logEntries.isLoadingCommit,
        selected: state.logEntries.selected,
    };
}

export default connect(mapStateToProps)(LogEntryView);
