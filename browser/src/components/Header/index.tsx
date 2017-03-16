import * as React from 'react';

interface HeaderProps {
  clearResults: () => any;
  toggleAppendResults: () => any;
  appendResults: boolean;
}

interface HeaderState {
  /* empty */
}

class Header extends React.Component<HeaderProps, HeaderState> {

  constructor(props?: HeaderProps, context?: any) {
    super(props, context);
  }
  render() {
    return (
      <header>
        <label>
          <input type="checkbox"
            checked={this.props.appendResults}
            onChange={() => this.props.toggleAppendResults()} />
          Append Results
        </label>
        <button onClick={() => this.props.clearResults()}>Clear Results</button>
      </header>
    );
  }
}

export default Header;
