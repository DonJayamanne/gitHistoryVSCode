import { Ref } from '../../../definitions';
import * as React from 'react';

export default function HeadRef(props: Ref) {
    return (<div className='media-image ref'>
        <div className='commit-head-container'>
            <div className='refs'>
                <span>{props.name}</span>
            </div>
        </div>
    </div>);
}