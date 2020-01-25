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
    onClick(entry: LogEntry): void;
    onNewClick(entry: LogEntry): void;
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
                <div className='commit-hash-container'>
                    <div>
                        <span className='btnx hint--left hint--rounded hint--bounce' aria-label='New branch or tag'>
                            <a role='button' onClick={() => props.onNewClick(props.logEntry)}>
                                <GoPlus></GoPlus>
                            </a>
                        </span>
                    </div>
                    <CopyToClipboard text={props.logEntry.hash.full}>
                        <div>
                            <span className='btnx clipboard hint--left hint--rounded hint--bounce'
                                aria-label='Copy the full Hash'>
                                <GoClippy></GoClippy>
                            </span>
                        </div>
                    </CopyToClipboard>
                    <div>
                        <span className='btnx hint--left hint--rounded hint--bounce' aria-label='Cherry pick, Compare, etc'>
                            <a role='button' onClick={() => props.onClick(props.logEntry)}>
                                <GoGitCommit></GoGitCommit>
                            </a>
                        </span>
                    </div>
                    <div role='button' onClick={() => props.onViewCommit(props.logEntry)}>
                        <span className='sha-code short' aria-label={props.logEntry.hash.short}>{props.logEntry.hash.short}</span>
                    </div>
                </div>
            </div>
            <div className='media-image'>
                <div className='ref'>
                    {renderRemoteRefs(props.logEntry.refs)}
                    {renderHeadRef(props.logEntry.refs)}
                    {renderTagRef(props.logEntry.refs)}
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
