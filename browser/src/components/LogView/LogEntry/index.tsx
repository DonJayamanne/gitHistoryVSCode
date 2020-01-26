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

type ResultListPropsSentToComponent = {
    logEntry: LogEntry;
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
};

type ResultListProps = ResultListPropsSentToComponent & {
    selected: LogEntry;
};

function renderRemoteRefs(refs: Ref[]) {
    return refs
        .filter(ref => ref.type === RefType.RemoteHead)
        .map(ref => (<RemoteRef key={ref.name} {...ref} />));
}

function renderHeadRef(refs: Ref[]) {
    return refs
        .filter(ref => ref.type === RefType.Head)
        .map(ref => (<HeadRef key={ref.name} {...ref} />));
}

function renderTagRef(refs: Ref[]) {
    return refs
        .filter(ref => ref.type === RefType.Tag)
        .map(ref => (<TagRef key={ref.name} {...ref} />));
}

// tslint:disable-next-line:function-name
function LogEntry(props: ResultListProps) {
    const isActive = props.selected && props.logEntry && props.selected.hash.full === props.logEntry.hash.full;
    const cssClassName = `log-entry ${isActive ? 'active' : ''}`;
    return (<div className={cssClassName}>
        <div className='media right'>
            <div className='media-image'>
                <div className='ref'>
                    {renderRemoteRefs(props.logEntry.refs)}
                    {renderHeadRef(props.logEntry.refs)}
                    {renderTagRef(props.logEntry.refs)}
                    &nbsp;
                </div>
                <div className='buttons'>
                    <CopyToClipboard text={props.logEntry.hash.full}>
                    <span className='btnx hash clipboard hint--left hint--rounded hint--bounce' aria-label="Copy hash to clipboard">
                        {props.logEntry.hash.short}&nbsp;
                        <GoClippy></GoClippy>
                    </span>
                    </CopyToClipboard>
                    &nbsp;
                    <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Create a new tag'>
                        <a role='button' onClick={() => props.onAction(props.logEntry, 'newtag')}>
                        <GoPlus></GoPlus>Tag
                        </a>
                    </span>
                    <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Create a new branch from here'>
                        <a role='button' onClick={() => props.onAction(props.logEntry, 'newbranch')}>
                        <GoPlus></GoPlus>Branch
                        </a>
                    </span>
                    <span role='button' className='btnx hint--left hint--rounded hint--bounce' aria-label='Cherry pick, Compare, etc'>
                        <a role='button' onClick={() => props.onAction(props.logEntry, '')}>
                            <GoGitCommit></GoGitCommit>More
                        </a>
                    </span>
                </div>
            </div>
            <div role='button' className='media-content' onClick={() => props.onViewCommit(props.logEntry)}>
                <div className='commit-subject' title={gitmojify(props.logEntry.subject)}>{gitmojify(props.logEntry.subject)}</div>
                <Avatar result={props.logEntry.author}></Avatar>
                <Author result={props.logEntry.author}></Author>
            </div>
        </div>
    </div>);
}

function mapStateToProps(state: RootState, wrapper: ResultListPropsSentToComponent): ResultListProps {
    return {
        ...wrapper,
        selected: state.logEntries.selected
    };
}

export default connect(
    mapStateToProps
)(LogEntry);
