import { IClassRequirementDescriptor } from 'tslint/lib/rules/completedDocsRule';
import * as React from 'react';

interface CommitFileProps {
  fileName: string;
  onSelect: (ILogEntry) => void;

}

interface CommitFileState {
  /* empty */
}

class CommitFile extends React.Component<CommitFileProps, CommitFileState> {
  render() {
    return <div className='file-name-cnt'>
      <span className='file-name'>{this.props.fileName}</span>
    </div>;
  }
}

export default CommitFile;
