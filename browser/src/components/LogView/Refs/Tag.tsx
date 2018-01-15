import { Ref } from '../../../definitions';
import * as React from 'react';

export default function HeadRef(props: Ref) {
    return (<div className='media-image ref'>
        <div className='commit-tag-container'>
            <div className='refs'>
                <span title={props.name}>{props.name}</span>
            </div>
        </div>
    </div>);
}
