import * as React from 'react';
import { LogEntry, Ref } from '../../../definitions';

import Chip from '@material-ui/core/Chip';
import TableCell from '@material-ui/core/TableCell';
import { AutoSizer, Column, Table } from 'react-virtualized';

interface ResultProps {
    logEntries: LogEntry[];
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
}

interface LogEntriesState {
    headerHeight: number;
    rowHeight: number;
}

export default class LogEntryVirtualizedTable extends React.Component<ResultProps, LogEntriesState> {
    private columns: any;

    constructor(props?: ResultProps, context?: any) {
        super(props, context);

        this.state = { headerHeight: 48, rowHeight: 48 };
        this.columns = [
            {
                width: 200,
                label: 'Subject',
                dataKey: 'subject',
            },
            {
                width: 200,
                label: 'Created',
                dataKey: 'date',
            }
        ];
    }

    headerRenderer = ({ label, columnIndex }) => {
        return (
            <TableCell
                component="div"
                variant="head"
                style={{ height: this.state.headerHeight }}
                align={this.columns[columnIndex].numeric || false ? 'right' : 'left'}
            >
                <span>{label}</span>
            </TableCell>
        );
    };

    cellRenderer = ({ cellData, columnIndex }) => {
        return (
            <TableCell
                component="div"
                variant="body"
                style={{ height: this.state.rowHeight }}
                align={(columnIndex != null && this.columns[columnIndex].numeric) || false ? 'right' : 'left'}
            >
                <Chip label="Basic" component="a" href="#chip" />
                {cellData}
            </TableCell>
        );
    };

    render() {
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        height={height}
                        width={width}
                        rowHeight={60}
                        gridStyle={{ direction: 'inherit' }}
                        headerHeight={this.state.headerHeight}
                        {...this.props}
                    >
                        {this.columns.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={headerProps =>
                                        this.headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    {...other}
                                />
                            );
                        })}
                    </Table>
                )}
            </AutoSizer>
        );
    }
}