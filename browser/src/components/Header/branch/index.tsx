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
}

export class Branch extends React.Component<BranchProps, BranchState> {
    constructor(props: BranchProps) {
        super(props);
        this.state = { isLoading: props.isLoading, branch: props.branch, branches: props.branches };
    }
    public componentWillReceiveProps(nextProps: BranchProps): void {
        this.setState({ isLoading: nextProps.isLoading, branch: nextProps.branch, branches: nextProps.branches });
    }
    private onSelect = (branch: string) => {
        const selectedBranch = branch === '[ALL]' ? '' : branch;
        this.setState({ isLoading: this.state.isLoading });
        this.props.selectBranch(selectedBranch.trim());
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        const title = !this.props.branch || this.props.branch === '' ? 'All branches' : this.props.branch;
        const selectedBranch = !this.props.branch || this.props.branch === '' ? '[ALL]' : this.props.branch;
        const branches = Array.isArray(this.props.branches) ? this.props.branches : [];
        const branchList = branches.map(branch => {
            if (branch.name === selectedBranch) {
                return <MenuItem key={branch.name} active eventKey={branch.name}>{branch.name}</MenuItem>;
            } else {
                return <MenuItem key={branch.name} eventKey={branch.name}>{branch.name}</MenuItem>;
            }
        });

        return (<DropdownButton
            bsStyle='primary'
            bsSize='small'
            title={title}
            key={selectedBranch}
            onSelect={this.onSelect}
            id='authorSelection'
        >
            <MenuItem eventKey='[ALL]'>All branches</MenuItem>
            <MenuItem divider />
            {branchList}
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
