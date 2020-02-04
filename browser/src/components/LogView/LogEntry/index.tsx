import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { LogEntry, Ref, RefType } from '../../../definitions';
import { RootState } from '../../../reducers/index';
import Author from '../Commit/Author';
import Avatar from '../Commit/Avatar';
import { gitmojify } from '../gitmojify';
import HeadRef from '../Refs/Head';
import RemoteRef from '../Refs/Remote';
import TagRef from '../Refs/Tag';
import { GoGitCommit, GoClippy, GoPlus } from 'react-icons/lib/go';


type ResultListProps = {
    logEntry: LogEntry;
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(ref: Ref, name: string): void;
};

class LogEntryView extends React.Component<ResultListProps, {}> {
    constructor(props?: ResultListProps, context?: any) {
        super(props, context);
    }

    private renderRemoteRefs() {
        return this.props.logEntry.refs
        .filter(ref => ref.type === RefType.RemoteHead)
        .map(ref => (<RemoteRef key={ref.name} onRemove={() => this.props.onRefAction(ref, 'removeRemote')} {...ref} />));
    }

    private renderHeadRef() {
        return this.props.logEntry.refs
        .filter(ref => ref.type === RefType.Head)
        .map(ref => (<HeadRef key={ref.name} {...ref} />));
    }

    private renderTagRef() {
        return this.props.logEntry.refs
        .filter(ref => ref.type === RefType.Tag)
        .map(ref => (<TagRef key={ref.name} onRemove={() => this.props.onRefAction(ref, 'removeTag')} {...ref} />));
    }

    public render() {
        //const isActive = this.props.logEntry && props.logEntry && props.selected.hash.full === props.logEntry.hash.full;
        //const cssClassName = `log-entry ${isActive ? 'active' : ''}`;
        const cssClassName = `log-entry`;
        return (<div className={cssClassName}>
            <div className='media right'>
                <div className='media-image'>
                    <div className='ref'>
                        {this.renderRemoteRefs()}
                        {this.renderHeadRef()}
                        {this.renderTagRef()}
                    </div>
                    <div className='buttons'>
                        <div>
                            <CopyToClipboard text={this.props.logEntry.hash.full}>
                            <span className='btnx hash clipboard hint--left hint--rounded hint--bounce' aria-label="Copy hash to clipboard">
                                {this.props.logEntry.hash.short}&nbsp;
                                <GoClippy></GoClippy>
                            </span>
                            </CopyToClipboard>
                            &nbsp;
                            <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Create a new tag'>
                                <a role='button' onClick={() => this.props.onAction(this.props.logEntry, 'newtag')}>
                                <GoPlus></GoPlus>Tag
                                </a>
                            </span>
                            <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Create a new branch from here'>
                                <a role='button' onClick={() => this.props.onAction(this.props.logEntry, 'newbranch')}>
                                <GoPlus></GoPlus>Branch
                                </a>
                            </span>
                            <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Cherry pick, Compare, etc'>
                                <a role='button' onClick={() => this.props.onAction(this.props.logEntry, '')}>
                                    <GoGitCommit></GoGitCommit>More
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
                <div role='button' className='media-content' onClick={() => this.props.onViewCommit(this.props.logEntry)}>
                    <div className='commit-subject' title={gitmojify(this.props.logEntry.subject)}>{gitmojify(this.props.logEntry.subject)}</div>
                    <Avatar result={this.props.logEntry.author}></Avatar>
                    <Author result={this.props.logEntry.author}></Author>
                </div>
            </div>
        </div>);
    }
}

function mapStateToProps(state: RootState, wrapper: ResultListProps): ResultListProps {
    return {
        ...wrapper
    };
}

export default connect(
    mapStateToProps
)(LogEntryView);
