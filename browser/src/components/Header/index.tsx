import axios from 'axios';
import * as React from 'react';
import { Button, ButtonGroup, DropdownButton, MenuItem, SplitButton } from 'react-bootstrap';
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
    private onClick = () => {
        if (!this.state.isLoading) {
            this.handleClick();
        }
    }

    private handleClick() {
        this.setState({ isLoading: true });
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        axios.get('/log')
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

    public render() {
        return (<header>
            <label>
                Append Results
        </label>
            <ButtonGroup>
                <DropdownButton bsStyle='success' title='Dropdown'>
                    <MenuItem key='1'>Dropdown link</MenuItem>
                    <MenuItem key='2'>Dropdown link</MenuItem>
                </DropdownButton>
                <Button bsStyle='info'>Middle</Button>
                <Button bsStyle='info'>Right</Button>
            </ButtonGroup>
            <Button
                bsStyle='primary' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClick}>
                {this.state.isLoading ? 'Loading...' : 'Loading state'}
            </Button>
            <button>Clear Results</button>
        </header>);
    }
}
