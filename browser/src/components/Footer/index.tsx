import * as React from 'react';
import { Button } from 'react-bootstrap';

type FooterProps = {
    canGoForward: boolean;
    canGoBack: boolean;
    goForward: () => void;
    goBack: () => void;
};
export default function Footer(props: FooterProps) {
    return (
        <div id='history-navbar'>
            <Button bsStyle='primary' className='navbar-link' className={props.canGoBack ? '' : 'disabled'} onClick={() => props.goBack()}>
                <i className='octicon octicon-chevron-left'></i>
                <span>Previous</span>
            </Button>
            <Button bsStyle='primary' className='navbar-link' lassName={props.canGoForward ? '' : 'disabled'} onClick={() => props.goForward()}>
                <span>Next</span>
                <i className='octicon octicon-chevron-right'></i>
            </Button>
        </div>
    );
}
