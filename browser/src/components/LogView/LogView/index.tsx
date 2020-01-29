import * as React from 'react';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { LogEntries, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import BranchGraph from '../BranchGraph';
import LogEntryList from '../LogEntryList';
import Dialog from '../../Dialog';

type LogViewProps = {
    logEntries: LogEntries;
    commitsRendered: typeof ResultActions.commitsRendered;
    onViewCommit: typeof ResultActions.selectCommit;
    actionCommit: typeof ResultActions.actionCommit;
    refresh: typeof ResultActions.refresh;
    selectBranch: typeof ResultActions.selectBranch;
};

// tslint:disable-next-line:no-empty-interface
interface LogViewState {
}

class LogView extends React.Component<LogViewProps, LogViewState> {
    private ref: React.RefObject<LogEntryList>;
    private dialog: Dialog;
    // tslint:disable-next-line:no-any
    constructor(props?: LogViewProps, context?: any) {
        super(props, context);
        // this.state = { height: '', width: '', itemHeight: 0 };
        this.ref = React.createRef<LogEntryList>();
    }
    
    public componentDidUpdate() {
        const el = this.ref.current.ref;

        if (this.props.logEntries.selected) {
            return;
        }

        if(el.hasChildNodes() && this.props.logEntries && !this.props.logEntries.isLoading && !this.props.logEntries.isLoadingCommit && Array.isArray(this.props.logEntries.items) && this.props.logEntries.items.length > 0) {          
            // use the total height to be more accurate in positioning the dots from BranchGraph
            const totalHeight = el.offsetHeight;
            const logEntryHeight = totalHeight / this.props.logEntries.items.length;
            this.props.commitsRendered(logEntryHeight);
        }
    }

    public render() {
        return (
            // tslint:disable-next-line:react-this-binding-issue
            <div className='log-view' id='scrollCnt'>
                <BranchGraph></BranchGraph>
                <LogEntryList ref={this.ref} logEntries={this.props.logEntries.items}
                    onAction={this.onAction}
                    onViewCommit={this.onViewCommit}>
                </LogEntryList>
                <Dialog ref={(r) => this.dialog = r} onOk={this.onActionCommit.bind(this)} />
            </div>
        );
    }

    public onViewCommit = (logEntry: LogEntry) => {
        this.props.onViewCommit(logEntry.hash.full);
    }

    public onAction = (entry: LogEntry, name: string = '') => {
        switch (name) {
            case 'newtag':
                this.dialog.showInput("Create a new tag on " + entry.hash.short, '<strong>' + entry.subject + '</strong><br />' + entry.author.name + ' on ' + entry.author.date.toISOString(), 'Enter tag here', {entry, name});
                break;
            case 'newbranch':
                this.dialog.showInput("Create a branch from " + entry.hash.short, '<strong>' + entry.subject + '</strong><br />' + entry.author.name + ' on ' + entry.author.date.toISOString(), 'Enter branch name here', {entry, name});
                break;
            default:
                this.props.actionCommit(entry, name);
                break;
        }
    }

    public onActionCommit = (sender: HTMLButtonElement, args: any) => {
        this.props.actionCommit(args.entry, args.name, this.dialog.getValue());

        switch (args.name) {
            case 'newtag':
                this.props.refresh();
                break;
            case 'newbranch':
                this.props.selectBranch(this.dialog.getValue());
                break;
        }
    }
}
function mapStateToProps(state: RootState, wrapper: { logEntries: LogEntries }) {
    return {
        logEntries: wrapper.logEntries
    };
}

function mapDispatchToProps(dispatch) {
    return {
        commitsRendered: (height: number) => dispatch(ResultActions.commitsRendered(height)),
        onViewCommit: (hash: string) => dispatch(ResultActions.selectCommit(hash)),
        actionCommit: (logEntry: LogEntry, name: string, value: string = '') => dispatch(ResultActions.actionCommit(logEntry, name, value)),
        refresh: () => dispatch(ResultActions.refresh()),
        selectBranch: (branchName: string) => dispatch(ResultActions.selectBranch(branchName)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogView);
