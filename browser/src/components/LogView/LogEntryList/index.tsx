import * as React from 'react';
import { Element, Events, scrollSpy } from 'react-scroll';
import { LogEntry } from '../../../definitions';
import LogEntryView from '../LogEntry';

interface ResultProps {
    logEntries: LogEntry[];
    onViewCommit(entry: LogEntry): void;
    onClick(entry: LogEntry): void;
}

export default class LogEntryList extends React.Component<ResultProps> {
    // private scrolled;
    private ref: HTMLDivElement;
    public componentDidUpdate() {

    }
    public componentDidMount() {
        scrollSpy.update();
    }
    public componentWillUnmount() {
        Events.scrollEvent.remove('begin');
        Events.scrollEvent.remove('end');
    }
    public render() {
        if (!Array.isArray(this.props.logEntries)) {
            return null;
        }

        const results = this.props.logEntries.map(entry =>
            <Element name={entry.hash.full} className='myItem' key={entry.hash.full}>
                <LogEntryView
                    key={entry.hash.full}
                    logEntry={entry}
                    onViewCommit={this.props.onViewCommit}
                    onClick={this.props.onClick} />
            </Element>
        );
        return (
            // tslint:disable-next-line:react-this-binding-issue
            <div ref={(ref) => this.ref = ref}>
                {results}
            </div>
        );
    }
}
