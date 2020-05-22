import * as React from 'react';

import { List, InfiniteLoader, AutoSizer } from 'react-virtualized';
import { RootState, LogEntriesState } from '../../../reducers';
import { connect } from 'react-redux';
import { ResultActions } from '../../../actions/results';

import LogEntryView from '../LogEntry';
import { LogEntry, Ref } from '../../../../../src/types';

interface ResultProps {
    logEntries?: LogEntriesState;
    getCommits?(startIndex: number, stopIndex: number): Promise<any>;
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
}

interface LogEntryTableState {}

class LogEntryVirtualizedTable extends React.Component<ResultProps, LogEntryTableState> {
    constructor(props?: ResultProps, context?: any) {
        super(props, context);
        this.state = {};
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

    render() {
        return (
            <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMoreRows}
                rowCount={this.props.logEntries.count}
                threshold={15}
            >
                {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                width={width}
                                rowHeight={59.87}
                                onRowsRendered={onRowsRendered}
                                ref={registerChild}
                                rowCount={this.props.logEntries.count}
                                rowRenderer={this.rowRenderer}
                            />
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        logEntries: state.logEntries,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getCommits: (startIndex: number, stopIndex: number) =>
            dispatch(ResultActions.getCommits(startIndex, stopIndex)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogEntryVirtualizedTable);
