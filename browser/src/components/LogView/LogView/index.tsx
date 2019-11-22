import * as React from 'react';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { LogEntries, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import BranchGraph from '../BranchGraph';
import LogEntryList from '../LogEntryList';

type LogViewProps = {
    logEntries: LogEntries;
    commitsRendered: typeof ResultActions.commitsRendered;
    onViewCommit: typeof ResultActions.selectCommit;
    actionACommit: typeof ResultActions.actionACommit;
};

// tslint:disable-next-line:no-empty-interface
interface LogViewState {
}

class LogView extends React.Component<LogViewProps, LogViewState> {
    // tslint:disable-next-line:no-any
    constructor(props?: LogViewProps, context?: any) {
        super(props, context);
        // this.state = { height: '', width: '', itemHeight: 0 };
        this.ref = React.createRef<LogEntryList>();
    }
    private ref: React.RefObject<LogEntryList>;
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
                    onClick={this.onClick}
                    onViewCommit={this.onViewCommit}></LogEntryList>
            </div>
        );
    }

    public onViewCommit = (logEntry: LogEntry) => {
        this.props.onViewCommit(logEntry.hash.full);
    }
    public onClick = (entry: LogEntry) => {
        this.props.actionACommit(entry);
    }
}
function mapStateToProps(state: RootState, wrapper: { logEntries: LogEntries }) {
    return {
        logEntries: wrapper.logEntries
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // ...bindActionCreators({ ...ResultActions }, dispatch),
        // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
        commitsRendered: (height: number) => dispatch(ResultActions.commitsRendered(height)),
        onViewCommit: (hash: string) => dispatch(ResultActions.selectCommit(hash)),
        actionACommit: (logEntry: LogEntry) => dispatch(ResultActions.actionACommit(logEntry))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogView);
