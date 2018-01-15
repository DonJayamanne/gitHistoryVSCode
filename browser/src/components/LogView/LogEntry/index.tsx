import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { LogEntry, Ref, RefType } from '../../../definitions';
import { RootState } from '../../../reducers/index';
import Author from '../Commit/Author';
import { gitmojify } from '../gitmojify';
import HeadRef from '../Refs/Head';
import RemoteRef from '../Refs/Remote';
import TagRef from '../Refs/Tag';
// tslint:disable-next-line:no-require-imports no-var-requires
const GoClippy = require('react-icons/lib/go/clippy');
// tslint:disable-next-line:no-require-imports no-var-requires
const GoGitCommit = require('react-icons/lib/go/git-commit');
// tslint:disable-next-line:no-require-imports no-var-requires
// const GoGitPullRequest = require('react-icons/lib/go/git-pull-request');

type ResultListPropsSentToComponent = {
    logEntry: LogEntry;
    onViewCommit(entry: LogEntry): void;
    onClick(entry: LogEntry): void;
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
                    <CopyToClipboard text={props.logEntry.hash.full}>
                        <div className='copy-button'>
                            <span className='btnx clipboard hint--left hint--rounded hint--bounce'
                                aria-label='Copy the full Hash'>
                                <GoClippy></GoClippy>
                            </span>
                        </div>
                    </CopyToClipboard>
                    <div className='cherry-pick-button'>
                        <span className='btnx hint--left hint--rounded hint--bounce' aria-label='Cherry pick, Compare, etc'><span aria-label='Cherry pick, Compare, etc' />
                            <a role='button' href='javascript:void(0);' onClick={() => props.onClick(props.logEntry)}>
                                <GoGitCommit></GoGitCommit>
                            </a>
                        </span>
                    </div>
                    <div role='button' className='commit-hash' onClick={() => props.onViewCommit(props.logEntry)}>
                        <span className='sha-code short' aria-label={props.logEntry.hash.short}>{props.logEntry.hash.short}</span>
                    </div>
                </div>
            </div>
            {renderRemoteRefs(props.logEntry.refs)}
            {renderHeadRef(props.logEntry.refs)}
            {renderTagRef(props.logEntry.refs)}
            <div role='button' className='media-content' onClick={() => props.onViewCommit(props.logEntry)}>
                <a className='commit-subject-link'>{props.logEntry.subject}</a>
                <div className='commit-subject' title={gitmojify(props.logEntry.subject)}>{gitmojify(props.logEntry.subject)}</div>
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
