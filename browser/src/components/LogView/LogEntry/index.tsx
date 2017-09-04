import HeadRef from '../Refs/Head';
import RemoteRef from '../Refs/Remote';
import { LogEntry, Ref, RefType } from '../../../definitions';
import * as React from 'react';
import Author from '../Commit/Author';
import CopyToClipboard from 'react-copy-to-clipboard';
const GoClippy = require('react-icons/lib/go/clippy');
const GoGitCommit = require('react-icons/lib/go/git-commit');
const GoGitPullRequest = require('react-icons/lib/go/git-pull-request');

interface ResultListProps {
  logEntry: LogEntry;
  onViewCommit: (entry: LogEntry) => void;
  onClick: (entry: LogEntry) => void;
  onCherryPick: (entry: LogEntry) => void;
}

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

function ResultList(props: ResultListProps) {
  return (<div className='log-entry'>
    <div className='media right'>
      <div className='media-image'>
        <div className='commit-hash-container'>
          <CopyToClipboard text={props.logEntry.hash.full}>
            <div className='copy-button'>
              <span className='btnx clipboard hint--bottom hint--rounded hint--bounce'
                aria-label='Copy the full Hash'>
                <GoClippy></GoClippy>
              </span>
            </div>
          </CopyToClipboard>
          <div className='cherry-pick-button'>
            <span className='btnx hint--bottom hint--rounded hint--bounce' aria-label='Cherry pick into branch'><span aria-label='Cherry pick into branch' />
              <a href='javascript:void(0);' onClick={() => props.onCherryPick(props.logEntry)}>
                <GoGitPullRequest></GoGitPullRequest>
              </a>
            </span>
          </div>
          <div className='cherry-pick-button'>
            <span className='btnx hint--bottom hint--rounded hint--bounce' aria-label='Compare'><span aria-label='Compare' />
              <a href='javascript:void(0);' onClick={() => props.onClick(props.logEntry)}>
                <GoGitCommit></GoGitCommit>
              </a>
            </span>
          </div>
          <div className='commit-hash' onClick={() => props.onViewCommit(props.logEntry)}>
            <span className='sha-code short' aria-label={props.logEntry.hash.short}>{props.logEntry.hash.short}</span>
          </div>
        </div>
      </div>
      {renderRemoteRefs(props.logEntry.refs)}
      {renderHeadRef(props.logEntry.refs)}
      <div className='media-content' onClick={() => props.onViewCommit(props.logEntry)}>
        <a className='commit-subject-link'>{props.logEntry.subject}</a>
        <div className='commit-subject' title={props.logEntry.subject}>{props.logEntry.subject}</div>
        <Author result={props.logEntry.author}></Author>
      </div>
    </div>
  </div>);
}

export default ResultList;
