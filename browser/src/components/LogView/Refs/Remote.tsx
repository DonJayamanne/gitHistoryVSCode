import { Ref } from '../../../definitions';
import * as React from 'react';
import { GoGitBranch, GoX } from 'react-icons/go';

export default function RemoteRef(props: Ref) {
    return (
        <div className="commit-remote-container">
            <div className="refs">
                <span>
                    <GoGitBranch></GoGitBranch>
                </span>
                <span title={props.name}>{props.name}</span>
                <a className="remove" onClick={() => props.onRemove()} role="button">
                    <GoX></GoX>
                </a>
            </div>
        </div>
    );
}
