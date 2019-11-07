import * as React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../actions/results';
import { RootState } from '../../reducers/index';
import Author from './author';
import Branch from './branch';

interface HeaderProps {
    isLoading?: boolean;
    searchText?: string;
    search(searchText: string): void;
    clearSearch(): void;
    refresh(): void;
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
    private onSearch = () => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
            this.props.search(this.state.searchText);
        }
    }
    private onClear = () => {
        this.setState({ isLoading: this.state.isLoading, searchText: '' });
        if (!this.state.isLoading) {
            this.setState({ isLoading: true, searchText: '' });
            this.props.clearSearch();
        }
    }
    private onRefresh = () => {
        this.setState({ isLoading: this.state.isLoading });
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
            this.props.refresh();
        }
    }
    componentWillReceiveProps(nextProps: HeaderProps): void {
        this.setState({ isLoading: nextProps.isLoading, searchText: nextProps.searchText });
    }
    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ isLoading: this.state.isLoading, searchText: e.target.value });
    }

    private handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.onSearch();
        } else if (e.key === 'Escape') {
            this.onClear();
        }
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        return (<header>
            <input className={'textInput'} type="text" value={this.state.searchText} placeholder="Enter term and press enter to search" onKeyDown={this.handleKeyDown} onChange={this.handleSearchChange} />
            <Button
                bsStyle='primary' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onSearch}>
                {this.state.isLoading ? 'Loading...' : 'Search'}
            </Button>
            <Branch></Branch>
            <Author></Author>
            <Button
                bsStyle='warning' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClear}>Clear</Button>
            <Button
                bsStyle="info" bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onRefresh}>Refresh</Button>
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
        search: (text: string) => dispatch(ResultActions.search(text)),
        clearSearch: () => dispatch(ResultActions.clearSearch()),
        refresh: () => dispatch(ResultActions.refresh())
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
