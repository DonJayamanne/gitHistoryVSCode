import * as React from 'react';
const GoX = require('react-icons/lib/go/x');

interface AuthorProps {
  result: ActionedDetails;
}

interface AuthorState {
  /* empty */
}

class Author extends React.Component<AuthorProps, AuthorState> {
  render() {
    return <div className='commit-author'>
      <span className='name hint--right hint--rounded hint--bounce' aria-label={this.props.result.email}>{this.props.result.name}</span>
      <span className='timestamp'>on {this.props.result.localisedDate}</span>
    </div>;
  }
}

export default Author;
