// import axios from 'axios';
import * as React from 'react';
import { Button } from 'react-bootstrap';
// import { Button, Form, FormControl, FormGroup, ButtonGroup, ButtonToolbar, DropdownButton, MenuItem, InputGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../actions/results';
import { RootState } from '../../reducers/index';

// type HeaderProps = {
//     search: (searchText: string) => void;
// } & typeof ResultActions;

interface HeaderProps {
    isLoading?: boolean;
    searchText?: string;
    search(searchText: string): void;
}

interface HeaderState {
    isLoading?: boolean;
    searchText?: string;
}

export class Header extends React.Component<HeaderProps, HeaderState> {
    constructor(props: HeaderProps) {
        super(props);
        this.state = { isLoading: props.isLoading, searchText: props.searchText };
    }
    private onClick = () => {
        if (!this.state.isLoading) {
            this.handleClick();
        }
    }
    private onClear = () => {
        this.setState({ isLoading: this.state.isLoading, searchText: '' });
        if (!this.state.isLoading) {
            this.setState({ isLoading: true, searchText: '' });
            this.props.search('');
        }
    }
    componentWillReceiveProps(nextProps: HeaderProps): void {
        this.setState({ isLoading: nextProps.isLoading, searchText: nextProps.searchText });
    }
    private handleClick() {
        this.setState({ isLoading: true });
        this.props.search(this.state.searchText);

        // // tslint:disable-next-line:no-backbone-get-set-outside-model
        // axios.get('/log')
        //     .then(result => {
        //         // this.props.clearResults();
        //         //this.props.addResults(result.data);
        //         this.setState({ isLoading: false });
        //     })
        //     .catch(err => {
        //         this.setState({ isLoading: false });
        //         console.error('Result failed');
        //         console.error(err);
        //     });
        // this.setState({ isLoading: true });

        // // This probably where you would have an `ajax` call
        // setTimeout(() => {
        //   // Completed of async action, set loading state back
        //   this.setState({ isLoading: false });
        // }, 2000);
    }
    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ isLoading: this.state.isLoading, searchText: e.target.value });
    };

    // tslint:disable-next-line:member-ordering
    public render() {
        const style = { color: 'black' };
        return (<header>
            {/* <form>
                <FormGroup>
                    <InputGroup>
                        <FormControl type="text" value={this.state.searchText} onChange={this.handleSearchChange} />
                        <InputGroup.Button>
                            <Button
                                bsStyle='primary' bsSize='small'
                                disabled={this.state.isLoading}
                                onClick={this.onClick}>
                                {this.state.isLoading ? 'Loading...' : 'Search'}
                            </Button>
                            <Button
                                bsStyle='warning' bsSize='small'
                                disabled={this.state.isLoading}
                                onClick={this.onClear}>Clear</Button>

                        </InputGroup.Button>
                    </InputGroup>
                </FormGroup>
            </form> */}
            {/* <ButtonGroup>
                <DropdownButton bsStyle='success' title='Dropdown'>
                <MenuItem key='1'>Dropdown link</MenuItem>
                <MenuItem key='2'>Dropdown link</MenuItem>
                </DropdownButton>
                <Button bsStyle='info'>Middle</Button>
                <Button bsStyle='info'>Search</Button>
            </ButtonGroup> */}
            {/* <form> */}
            {/* <form>
                <FormGroup>
                    <InputGroup> */}
            <input type="text" value={this.state.searchText} style={style} onChange={this.handleSearchChange} />
            <Button
                bsStyle='primary' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClick}>
                {this.state.isLoading ? 'Loading...' : 'Search'}
            </Button>
            <Button
                bsStyle='warning' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClear}>Clear</Button>
        </header>);
    }
}

function mapStateToProps(state: RootState): HeaderState {
    const searchText = (state && state.logEntries.searchText) ?
        state.logEntries.searchText : '';
    const isLoading = state && state.logEntries && state.logEntries.isLoading;

    return {
        isLoading,
        searchText
    };
}


function mapDispatchToProps(dispatch) {
    return {
        search: (text: string) => dispatch(ResultActions.search(text))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
