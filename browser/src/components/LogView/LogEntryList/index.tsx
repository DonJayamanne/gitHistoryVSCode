import * as React from 'react';

import { List, InfiniteLoader, AutoSizer } from 'react-virtualized';
import { RootState, LogEntriesState } from '../../../reducers';
import { connect } from 'react-redux';
import { ResultActions } from '../../../actions/results';

import LogEntryView from '../LogEntry';
import { LogEntry, Ref, Graph, ISettings } from '../../../../../src/types';
import BranchGraph from '../BranchGraph';
import { RenderedRows } from 'react-virtualized/dist/es/List';

interface ResultProps {
    logEntries?: LogEntriesState;
    settings?: ISettings;
    getCommits?(startIndex: number, stopIndex: number): Promise<any>;
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
    commitsRendered: typeof ResultActions.commitsRendered;
}

class LogEntryVirtualizedTable extends React.Component<ResultProps, {}> {
    private ref: React.RefObject<InfiniteLoader>;
    private sizer: React.RefObject<AutoSizer>;

    constructor(props?: ResultProps, context?: any) {
        super(props, context);
        this.state = { updateGraph: true };
        this.ref = React.createRef();
        this.sizer = React.createRef();
    }

    componentDidUpdate(prevProps: ResultProps) {
        if (!prevProps.logEntries.isLoading && this.props.logEntries.isLoading) {
            this.ref.current.resetLoadMoreRowsCache(true);

            /*setTimeout(() => {
                this.props.commitsRendered({
                    itemHeight: 59.8,
                    height: this.sizer.current.state.height,
                    startIndex: 0,
                });
            }, 1000);*/
        }
    }

    isRowLoaded = ({ index }) => {
        return this.props.logEntries.items[index] !== undefined;
    };

    loadMoreRows = ({ startIndex, stopIndex }) => {
        return this.props.getCommits(startIndex, stopIndex);
    };

    rowRenderer = ({
        key, // Unique key within array of rows
        index, // Index of row within collection
        isScrolling, // The List is currently being scrolled
        isVisible, // This row is visible within the List (eg it is not an overscanned row)
        style, // Style object to be applied to row (to position it)
    }) => {
        const item = this.props.logEntries.items[index];

        return (
            <LogEntryView
                key={key}
                logEntry={item}
                style={style}
                onAction={this.props.onAction}
                onRefAction={this.props.onRefAction}
                onViewCommit={this.props.onViewCommit}
            />
        );
    };

    private timer: any;

    rowsRendered = (r: RenderedRows, height: number, callback: any = null) => {
        if (callback) callback(r);

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.props.commitsRendered({
                itemHeight: 59.8,
                height: height,
                startIndex: r.startIndex,
            });
        }, 700);
    };

    render() {
        return (
            <div className="log-view" id="scrollCnt">
                <BranchGraph />
                <InfiniteLoader
                    ref={this.ref}
                    minimumBatchSize={20}
                    isRowLoaded={this.isRowLoaded}
                    loadMoreRows={this.loadMoreRows}
                    rowCount={this.props.logEntries.count}
                >
                    {({ onRowsRendered, registerChild }) => (
                        <AutoSizer ref={this.sizer}>
                            {({ height, width }) => (
                                <List
                                    height={height}
                                    width={width}
                                    rowHeight={59.87}
                                    onRowsRendered={info => this.rowsRendered(info, height, onRowsRendered)}
                                    ref={registerChild}
                                    rowCount={this.props.logEntries.count}
                                    rowRenderer={this.rowRenderer}
                                />
                            )}
                        </AutoSizer>
                    )}
                </InfiniteLoader>
            </div>
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        logEntries: state.logEntries,
        settings: state.settings,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getCommits: (startIndex: number, stopIndex: number) =>
            dispatch(ResultActions.getCommits(startIndex, stopIndex)),
        commitsRendered: (graph: Graph) => dispatch(ResultActions.commitsRendered(graph)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogEntryVirtualizedTable);
