import * as React from 'react';
interface ResultListProps {
  result: NotebookOutput;
}

interface ResultListState {
  /* empty */
}

class ResultList extends React.Component<ResultListProps, ResultListState> {
  render() {
    return <div>Unknown Mime Type</div>;
  }
}

export default ResultList;
