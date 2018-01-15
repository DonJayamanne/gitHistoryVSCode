import { Ref } from '../../../definitions';
import * as React from 'react';
// tslint:disable-next-line:no-require-imports no-var-requires
const octicons = require('octicons');

export default function RemoteRef(props: Ref) {
    const svg = { __html: octicons["git-branch"].toSVG() };
    return (<div className='media-image ref'>
        <div className='commit-remote-container'>
            <div className='refs'>
                <span dangerouslySetInnerHTML={svg} />
                <span title={props.name}>{props.name}</span>
            </div>
        </div>
    </div>);
}
