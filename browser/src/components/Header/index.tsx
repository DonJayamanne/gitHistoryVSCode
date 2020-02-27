import * as React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { ResultActions } from '../../actions/results';
import { RootState, BranchesState } from '../../reducers/index';
import Author from './author';
import Branch from './branch';
import { ISettings } from '../../types';
import { GoMarkGithub, GoBrowser } from 'react-icons/lib/go';

interface HeaderProps {
    isLoading?: boolean;
    searchText?: string;
    branches?: BranchesState;
    settings?: ISettings;
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

    componentWillReceiveProps(nextProps: HeaderProps): void {
        this.setState({ isLoading: nextProps.isLoading, searchText: nextProps.searchText });
    }

    private onSearch = () => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
            this.props.search(this.state.searchText);
        }
    }
    private onClear = () => {
        this.setState({ isLoading: this.state.isLoading });
        if (!this.state.isLoading) {
            this.setState({ isLoading: true});
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
    
    private remoteLink() {
        if (this.props.branches.length === 0) {
            return (<span></span>);
        }

        const branchIndex = this.props.branches.findIndex(v => v.name === this.props.settings.branchName);

        if (branchIndex === -1) {
            return (<span></span>);
        }

        const selectedBranch = this.props.branches[branchIndex];

        if (!selectedBranch.remote) {
            return (<span></span>);
        }

        switch (selectedBranch.remoteType) {
            case 2:
                return (<a className='hint--right hint--rounded hint--bounce' aria-label='Open repository on Github' href={selectedBranch.remote.replace(/\.git$/, '') + '/tree/' + encodeURI(selectedBranch.name)}><GoMarkGithub /></a>);
            case 3:
                let m = selectedBranch.remote.match(/:(\w+)\/(.*)/);
                if (m) {
                    return (<a className='hint--right hint--rounded hint--bounce' aria-label='Open repository on Bitbucket' href={'https://bitbucket.org/' + m[1] + '/' + m[2] + '/src/' + encodeURI(selectedBranch.name) }><GoBrowser /></a>);
                }
        }

        return (<span></span>);
    }

    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ isLoading: this.state.isLoading, searchText: e.target.value });
    }

    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.onSearch();
        } else if (e.key === 'Escape') {
            this.onClear();
        }
    }

        public render() {
        return (<header>
            <input className={'textInput'} type="text" value={this.state.searchText} placeholder="Enter term and press enter to search" onKeyDown={this.handleKeyDown} onChange={this.handleSearchChange} />
            <Button
                bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onSearch}>
                {this.state.isLoading ? 'Loading...' : 'Search'}
            </Button>
            <Branch></Branch>
            <Author></Author>
            <Button
                bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onClear}>Clear</Button>
            <Button
                bsSize='small'
                disabled={this.state.isLoading}
                onClick={this.onRefresh}>Refresh</Button>
            <span style={{display: 'inline-block', marginLeft: '1em', fontSize: '130%', verticalAlign: 'middle'}}>
                {this.remoteLink()}
            </span>
        </header>);
    }
}

function mapStateToProps(state: RootState): HeaderProps {
    const searchText = (state && state.settings.searchText) ?
        state.settings.searchText : '';
    const isLoading = state && state.logEntries && state.logEntries.isLoading;

    return {
        isLoading,
        searchText,
        branches: state.branches,
        settings: state.settings
    } as HeaderProps;
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
