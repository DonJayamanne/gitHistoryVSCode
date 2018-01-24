import * as React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../actions/results';
import { RootState } from '../../reducers/index';
import Branch from './branch';

interface HeaderProps {
    isLoading?: boolean;
    searchText?: string;
    search(searchText: string): void;
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
            this.props.search('');
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

    // tslint:disable-next-line:member-ordering
    public render() {
        const style = { color: 'black' };
        return (<header>
            <input type="text" value={this.state.searchText} style={style} onChange={this.handleSearchChange} />
            <Button
                bsStyle='primary' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onSearch}>
                {this.state.isLoading ? 'Loading...' : 'Search'}
            </Button>
            <Button
                bsStyle='warning' bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClear}>Clear</Button>
            <Button
                bsStyle="info" bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onRefresh}>Refresh</Button>
            <Branch></Branch>
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
        refresh: () => dispatch(ResultActions.refresh())
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
