import { ActionedDetails } from '../../../../definitions';
import * as React from 'react';
const GoX = require('react-icons/lib/go/x');

interface AuthorProps {
  result: ActionedDetails;
}

export default function Author(props: AuthorProps) {
  return (<div className='commit-author'>
    <span className='name hint--right hint--rounded hint--bounce' aria-label={props.result.email}>{props.result.name}</span>
    <span className='timestamp'> on {props.result.localisedDate}</span>
  </div>);
}
