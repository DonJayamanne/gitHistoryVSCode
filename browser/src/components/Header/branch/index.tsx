import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { RootState, BranchesState } from '../../../reducers/index';
import { BranchSelection, ISettings } from '../../../types';

interface BranchProps {
    isLoading?: boolean;
    settings: ISettings;
    branches?: BranchesState;
    selectBranch(branchName: string, branchSelection: BranchSelection): void;
}

interface BranchState {
    title: string;
    detached: string;
    searchText: string;
}

export class Branch extends React.Component<BranchProps, BranchState> {
    private searchField: HTMLInputElement;
    constructor(props: BranchProps) {
        super(props);

        const detachedHash = this.props.settings.branchSelection === BranchSelection.Detached ? this.props.settings.branchName : '';

        this.state = { searchText: '', title: '', detached: detachedHash };
        this.searchField = null;
   
    }
    public componentWillReceiveProps(nextProps: BranchProps): void {
        let title = this.props.settings.branchName;

        if (this.props.settings.branchSelection === BranchSelection.Detached) {
            title = `[${this.props.settings.branchName.substr(0, 7)}]`;
        } else  if (this.props.settings.branchSelection === BranchSelection.All) {
            title = 'All branches';
        }

        this.setState({ title });
    }

    private onSelect = (branch: string) => {
        let branchSelection = BranchSelection.Current;

        if (branch === '[ALL]') {
            branchSelection = BranchSelection.All;
            branch = '';
        } else if (branch === '[DETACHED]') {
            branchSelection = BranchSelection.Detached;
            branch = this.state.detached;
        }
        this.props.selectBranch(branch, branchSelection);
    }

    private getDetached() {
        const active = this.props.settings.branchSelection === BranchSelection.Detached;
        if (this.state.detached) {
            return (<MenuItem active={active} eventKey="[DETACHED]">[{this.state.detached.substr(0, 7)}]</MenuItem>)
        }
    }

    private getAll() {
        const active = this.props.settings.branchSelection === BranchSelection.All
        return (<MenuItem active={active} eventKey='[ALL]'>All branches</MenuItem>)
    }

    private getBranchList() {
        const selectedBranch = !this.props.settings.branchName ? '[ALL]' : this.props.settings.branchName;
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
        return (<DropdownButton disabled={this.props.isLoading}
            bsStyle='primary'
            bsSize='small'
            title={this.state.title}
            onSelect={(e) => this.onSelect(e)}
            onClick={(e => this.onClick(e))}
            id='branchSelectionId'>
            {this.getAll()}
            {this.getDetached()}
            <MenuItem divider />
            <MenuItem header>
                <input ref={x => this.searchField = x} type="text" className='textInput' placeholder="Search.." id="myInput" value={this.state.searchText} onChange={this.handleSearchChange} />
            </MenuItem>
            <MenuItem divider />
            {this.getBranchList()}
        </DropdownButton>);
    }
}

function mapStateToProps(state: RootState): BranchProps {
    const branches = (state && state.branches) ?
        state.branches : [];
    const isLoading = state && state.logEntries && state.logEntries.isLoading;

    return {
        isLoading,
        settings: state.settings,
        branches
    } as BranchProps;
}

function mapDispatchToProps(dispatch) {
    return {
        selectBranch: (branchName: string, branchSelection: BranchSelection) => dispatch(ResultActions.selectBranch(branchName, branchSelection))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Branch);
