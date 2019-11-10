import { Ref } from '../../../definitions';
import * as React from 'react';
import octicons from '@primer/octicons';

export default function HeadRef(props: Ref) {
    const svg = { __html: octicons["tag"].toSVG() };
    return (<div className='media-image ref'>
        <div className='commit-tag-container'>
            <div className='refs'>
                <span dangerouslySetInnerHTML={svg} />
                <span title={props.name}>{props.name}</span>
            </div>
        </div>
    </div>);
}
