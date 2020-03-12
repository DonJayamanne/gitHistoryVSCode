import { Ref } from '../../../definitions';
import * as React from 'react';
import { GoTag, GoX } from 'react-icons/go';

export default function TagRef(props: Ref) {
    return (
        <div className="commit-tag-container">
            <div className="refs">
                <span>
                    <GoTag></GoTag>
                </span>
                <span title={props.name}>{props.name}</span>
                <a className="remove" onClick={() => props.onRemove()} role="button">
                    <GoX></GoX>
                </a>
            </div>
        </div>
    );
}
