import { LogEntry } from '../../../definitions';
import * as React from 'react';
import ResultList from '../LogEntry';

interface ResultProps {
  logEntries: LogEntry[];
  onSelect: (entry: LogEntry) => void;
  onClick: (entry: LogEntry) => void;
  onCherryPick: (entry: LogEntry) => void;
}

export default class LogEntryList extends React.Component<ResultProps> {
  componentDidUpdate() {
    console.log('LogEntryList Component Updated');
  }
  private ref: HTMLDivElement;

  render() {
    if (!Array.isArray(this.props.logEntries)) {
      return null;
    }

    let results = this.props.logEntries.map(entry =>
      <ResultList
        key={entry.hash.full}
        logEntry={entry}
        onSelect={this.props.onSelect}
        onCherryPick={this.props.onCherryPick}
        onClick={this.props.onClick} />
    );
    return (
      <div ref={(ref) => this.ref = ref}>
        {results}
      </div>
    );
  }
}
