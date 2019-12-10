import * as React from 'react';
import { LogEntry } from '../../../definitions';
import LogEntryView from '../LogEntry';

interface ResultProps {
    logEntries: LogEntry[];
    onViewCommit(entry: LogEntry): void;
    onClick(entry: LogEntry): void;
    onNewClick(entry: LogEntry): void;
}

export default class LogEntryList extends React.Component<ResultProps> {
    // private scrolled;
    public ref: HTMLDivElement;
    public componentDidUpdate() {

    }
    public componentDidMount() {
        
    }
    public componentWillUnmount() {
        
    }
    public render() {
        if (!Array.isArray(this.props.logEntries)) {
            return null;
        }

        const results = this.props.logEntries.map(entry =>
                <LogEntryView
                    key={entry.hash.full}
                    logEntry={entry}
                    onViewCommit={this.props.onViewCommit}
                    onNewClick={this.props.onNewClick}
                    onClick={this.props.onClick} />
        );
        return (
            // tslint:disable-next-line:react-this-binding-issue
            <div ref={(ref) => this.ref = ref}>
                {results}
            </div>
        );
    }
}
