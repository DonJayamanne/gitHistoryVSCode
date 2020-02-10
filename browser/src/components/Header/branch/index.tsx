import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { RootState, BranchesState } from '../../../reducers/index';

interface BranchProps {
    isLoading?: boolean;
    branch?: string;
    branches?: BranchesState;
    selectBranch(searchText: string): void;
}

interface BranchState {
    isLoading?: boolean;
    branch?: string;
    branches?: BranchesState;
    searchText?: string;
}

export class Branch extends React.Component<BranchProps, BranchState> {
    private searchField: HTMLInputElement;
    constructor(props: BranchProps) {
        super(props);
        this.state = { isLoading: props.isLoading, branch: props.branch, branches: props.branches };
        this.searchField = null;
    }
    public componentWillReceiveProps(nextProps: BranchProps): void {
        this.setState({ isLoading: nextProps.isLoading, branch: nextProps.branch, branches: nextProps.branches });
    }
    private onSelect = (branch: string) => {
        const selectedBranch = branch === '[ALL]' ? '' : branch;
        this.setState({ isLoading: this.state.isLoading });
        this.props.selectBranch(selectedBranch.trim());
    }

    private getBranchList() {
        const selectedBranch = !this.props.branch || this.props.branch === '' ? '[ALL]' : this.props.branch;
        let branches = Array.isArray(this.props.branches) ? this.props.branches : [];

        if (this.state.searchText) {
            branches = branches.filter(x => x.name.toLowerCase().indexOf( this.state.searchText.toLowerCase() ) !== -1);
        }

        return branches.map(branch => {
            if (branch.name === selectedBranch) {
                return <MenuItem key={branch.name} active eventKey={branch.name}>{branch.name}</MenuItem>;
            } else {
                return <MenuItem key={branch.name} eventKey={branch.name}>{branch.name}</MenuItem>;
            }
        });
    }

    private onClick = (e: React.MouseEvent<any, MouseEvent>) => {
        if (e.currentTarget.getAttribute('aria-expanded') === 'false') {
            setTimeout(() => { 
                this.searchField.select();
                this.searchField.focus();
            }, 300);
        }
    }

    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchText: e.target.value });
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        const title = !this.props.branch || this.props.branch === '' ? 'All branches' : this.props.branch;
        
        return (<DropdownButton
            bsStyle='primary'
            bsSize='small'
            title={title}
            onSelect={(e) => this.onSelect(e)}
            onClick={(e) => this.onClick(e)}
            id='branchSelection'
        >
            <MenuItem eventKey='[ALL]'>All branches</MenuItem>
            <MenuItem divider />
            <input ref={x => this.searchField = x} type="text" className='textInput' placeholder="Search.." id="myInput" value={this.state.searchText}  onChange={this.handleSearchChange} />
            <MenuItem divider />
            {this.getBranchList()}
        </DropdownButton>);
    }
}

function mapStateToProps(state: RootState): BranchState {
    const branch = (state && state.logEntries.branch) ?
        state.logEntries.branch : '';
    const branches = (state && state.branches) ?
        state.branches : [];
    const isLoading = state && state.logEntries && state.logEntries.isLoading;

    return {
        isLoading,
        branch,
        branches
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectBranch: (text: string) => dispatch(ResultActions.selectBranch(text))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Branch);
