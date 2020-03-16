import * as React from 'react';
import { LogEntry, Ref } from '../../../definitions';
import { Table, Column } from 'react-virtualized';

interface ResultProps {
    logEntries: LogEntry[];
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
}

export default class LogEntryList extends React.Component<ResultProps> {
    public ref: HTMLDivElement;
    public render() {
        return (
            <div className="container">
                <h1>Table example </h1>
                <Table
                    rowClassName="table-row"
                    headerHeight={40}
                    width={600}
                    height={300}
                    rowHeight={40}
                    rowCount={this.props.logEntries.length}
                    rowGetter={({ index }) => this.props.logEntries[index]}
                >
                    <Column label="Id" dataKey="id" width={50} />
                    <Column label="Name" dataKey="name" width={250} />
                    <Column label="E.mail" dataKey="email" width={300} />
                </Table>
            </div>
        );
    }
}
