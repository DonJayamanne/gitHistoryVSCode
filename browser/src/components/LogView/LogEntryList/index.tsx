import * as React from 'react';
import { LogEntry, Ref } from '../../../definitions';
import LogEntryView from '../LogEntry';

interface ResultProps {
    logEntries: LogEntry[];
    onViewCommit(entry: LogEntry): void;
    onAction(entry: LogEntry, name: string): void;
    onRefAction(logEntry: LogEntry, ref: Ref, name: string): void;
}

export default class LogEntryList extends React.Component<ResultProps> {
    public ref: HTMLDivElement;
    public render() {
        if (!Array.isArray(this.props.logEntries)) {
            return null;
        }

        const results = this.props.logEntries.map(entry => (
            <LogEntryView
                key={entry.hash.full}
                logEntry={entry}
                onAction={this.props.onAction}
                onRefAction={this.props.onRefAction}
                onViewCommit={this.props.onViewCommit}
            />
        ));
        return <div ref={ref => (this.ref = ref)}>{results}</div>;
    }
}
