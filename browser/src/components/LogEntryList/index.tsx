import * as React from 'react';
import LogEntry from '../LogEntry';

interface ResultProps {
  results: ILogEntry[];
  onSelect: (ILogEntry) => void;
}

interface ResultState {
  /* empty */
}

class LogEntryList extends React.Component<ResultProps, ResultState> {
  private renderResult(result: any) {
    return;
  }
  render() {
    let results = this.props.results.map(result =>
      <LogEntry key={result.sha1.full} result={result} onSelect={this.props.onSelect} />
    );
    return (
      <div>
        {results}
      </div>
    );
  }
}

export default LogEntryList;
