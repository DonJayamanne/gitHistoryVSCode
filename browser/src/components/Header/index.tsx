import * as React from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import * as ResultActions from '../../actions/results';

type HeaderProps = {
} & typeof ResultActions;

interface HeaderState {
  isLoading: boolean;
}

export default class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = { isLoading: false };
  }
  handleClick() {
    this.setState({ isLoading: true });
    let pageSize = 100;
    // pageSize = 30;
    axios.get(`/log?pageSize=` + pageSize)
      .then(result => {
        // this.props.clearResults();
        this.props.addResults(result.data);
        this.setState({ isLoading: false });
      })
      .catch(err => {
        this.setState({ isLoading: false });
        console.error('Result failed');
        console.error(err);
      });
    // this.setState({ isLoading: true });

    // // This probably where you would have an `ajax` call
    // setTimeout(() => {
    //   // Completed of async action, set loading state back
    //   this.setState({ isLoading: false });
    // }, 2000);
  }

  render() {
    return (<header>
      <label>
        Append Results
        </label>
      <Button
        bsStyle='primary' bsSize='small'
        disabled={this.state.isLoading}
        onClick={() => !this.state.isLoading ? this.handleClick() : null}>
        {this.state.isLoading ? 'Loading...' : 'Loading state'}
      </Button>
      <button>Clear Results</button>
    </header>);
  }
}
