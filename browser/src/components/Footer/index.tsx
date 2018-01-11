import * as React from 'react';

type FooterProps = {
    canGoForward: boolean;
    canGoBack: boolean;
    goForward: () => void;
    goBack: () => void;
};
export default function Footer(props: FooterProps) {
    return (
        <div id='history-navbar'>
            <ul className='navbar'>
                <li className={'navbar-item previous ' + (props.canGoBack ? '' : 'disabled')}>
                    <a href='javascript:void(0);' className='navbar-link' onClick={() => props.goBack()}>
                        <i className='octicon octicon-chevron-left'></i>
                        <span>Previous</span>
                    </a>
                </li>
                <li className={'navbar-item next ' + (props.canGoForward ? '' : 'disabled')}>
                    <a href='javascript:void(0);' className='navbar-link' onClick={() => props.goForward()}>
                        <span>Next</span>
                        <i className='octicon octicon-chevron-right'></i>
                    </a>
                </li>
            </ul>
        </div>
    );
}
