import * as React from 'react';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { LogEntries, LogEntry } from '../../../definitions';
import { RootState } from '../../../reducers';
import BranchGraph from '../BranchGraph';
import LogEntryList from '../LogEntryList';

type LogViewProps = {
    logEntries: LogEntries;
    setHeight: typeof ResultActions.logEntryHeightCalculated;
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

        if(el.hasChildNodes() && this.props.logEntries && Array.isArray(this.props.logEntries.items) && this.props.logEntries.items.length > 0) {          
            setTimeout(() => {
                const childEl = el.children[0] as HTMLDivElement;
                const logEntryHeight = childEl.offsetHeight + childEl.offsetTop;
                this.props.setHeight(logEntryHeight);
                this.props.commitsRendered();
            }, 1000);
        }
    }

    public render() {
        return (
            // tslint:disable-next-line:react-this-binding-issue
            <div className='log-view' id='scrollCnt'>
                <BranchGraph ></BranchGraph>
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
// function mapStateToProps(state: RootState) {
//   return {
//     logEntries: {
//       items: state.logEntries.items,
//       count: state.logEntries.count
//     }
//   };
// }

function mapDispatchToProps(dispatch) {
    return {
        // ...bindActionCreators({ ...ResultActions }, dispatch),
        // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
        setHeight: (height: number) => dispatch(ResultActions.logEntryHeightCalculated(height)),
        commitsRendered: () => dispatch(ResultActions.commitsRendered()),
        onViewCommit: (hash: string) => dispatch(ResultActions.selectCommit(hash)),
        actionACommit: (logEntry: LogEntry) => dispatch(ResultActions.actionACommit(logEntry))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogView);
