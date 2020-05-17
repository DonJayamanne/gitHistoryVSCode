import { Ref } from '../../../definitions';
import * as React from 'react';
import { GoGitBranch, GoX } from 'react-icons/go';

export default function HeadRef(props: Ref) {
    return (
        <div className="commit-head-container">
            <div className="refs">
                <a className="checkout" onClick={() => props.onAction('checkoutBranch')} role="button">
                    <span>
                        <GoGitBranch></GoGitBranch>
                    </span>
                    <span title={props.name}>{props.name}</span>
                </a>
                <a className="remove" onClick={() => props.onRemove()} role="button">
                    <GoX></GoX>
                </a>
            </div>
        </div>
    );
}
