import { Ref } from '../../../definitions';
import * as React from 'react';
import { GoTag } from 'react-icons/lib/go';

export default function HeadRef(props: Ref) {
    return (<div className='commit-tag-container'>
            <div className='refs'>
            <span><GoTag></GoTag></span>
                <span title={props.name}>{props.name}</span>
            </div>
        </div>);
}
