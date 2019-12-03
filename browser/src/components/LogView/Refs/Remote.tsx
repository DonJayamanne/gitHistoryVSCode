import { Ref } from '../../../definitions';
import * as React from 'react';
import { GoGitBranch } from 'react-icons/lib/go';

export default function RemoteRef(props: Ref) {
    return (<div className='media-image ref'>
        <div className='commit-remote-container'>
            <div className='refs'>
                <span><GoGitBranch></GoGitBranch></span>
                <span title={props.name}>{props.name}</span>
            </div>
        </div>
    </div>);
}
