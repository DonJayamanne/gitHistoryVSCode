import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { RootState } from '../../../reducers/index';

interface BranchProps {
    isLoading?: boolean;
    branch?: string;
    // selectBranch(searchText: string): void;
    search(searchText: string): void;
}

interface BranchState {
    isLoading?: boolean;
    branch?: string;
}

export class Branch extends React.Component<BranchProps, BranchState> {
    constructor(props: BranchProps) {
        super(props);
        this.state = { isLoading: props.isLoading, branch: props.branch };
    }
    public componentWillReceiveProps(nextProps: BranchProps): void {
        this.setState({ isLoading: nextProps.isLoading, branch: nextProps.branch });
    }
    // private selectBranch = (branch: string) => {
    //     if (!this.state.isLoading) {
    //         this.setState({ isLoading: true });
    //         // this.props.selectBranch(branch);
    //     }
    // }
    private onSelect = (branch: string) => {
        const selectedBranch = branch === '[All]' ? '' : branch;
        this.setState({ isLoading: this.state.isLoading });
        this.props.search(selectedBranch);
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        const title = 'Select branch';
        const selectedBranch = !this.props.branch || this.props.branch === '' ? '[All]' : this.props.branch;
        return (<DropdownButton
            bsStyle='primary'
            title={title}
            key={selectedBranch}
            onSelect={this.onSelect}
            id='branchSelection'
        >
            <MenuItem eventKey='1'>Action</MenuItem>
            <MenuItem eventKey='2'>Another action</MenuItem>
            <MenuItem eventKey='3' active>
                Active Item
			</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey='4'>Separated link</MenuItem>
        </DropdownButton>);
    }
}

function mapStateToProps(state: RootState): BranchState {
    const branch = (state && state.logEntries.branch) ?
        state.logEntries.branch : '';
    const isLoading = state && state.logEntries && state.logEntries.isLoading;

    return {
        isLoading,
        branch
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
)(Branch);
