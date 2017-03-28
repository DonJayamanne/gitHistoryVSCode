import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
const GoChevronLeft = require('react-icons/lib/go/chevron-left');
const GoChevronRight = require('react-icons/lib/go/chevron-right');

interface NavBarProps {
  isLoading: boolean;
  canGoBack: boolean;
  goBack: () => void;
  canGoNext: boolean;
  goNext: () => void;
}

interface NavBarState {
  /* empty */
}

class NavBar extends React.Component<NavBarProps, NavBarState> {
  render() {
    let previousStyle = `navbar-item previous ${this.props.canGoBack && !this.props.isLoading ? '' : ' disabled'}`;
    let nextStyle = `navbar-item next ${this.props.canGoNext && !this.props.isLoading ? '' : ' disabled'}`;
    return <div id='history-navbar'>
      <ul className='navbar'>
        <li className={previousStyle}>
          <a href='${prevHref}' className='navbar-link' onClick={() => this.props.goBack()}>
            <GoChevronLeft></GoChevronLeft>
            <span>Previous</span>
          </a>
        </li>
        <li className={nextStyle}>
          <a href='${nextHref}' className='navbar-link' onClick={() => this.props.goNext()}>
            <span>Next</span>
            <GoChevronRight></GoChevronRight>
          </a >
        </li >
      </ul >
    </div >;
  }
}

export default NavBar;
