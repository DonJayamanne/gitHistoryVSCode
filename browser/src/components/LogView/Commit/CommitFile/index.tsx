import { LogEntry } from '../../../../definitions';
import * as React from 'react';

interface CommitFileProps {
  fileName: string;
  onSelect: (entry: LogEntry) => void;
}

export default function CommitFile(props: CommitFileProps) {
  return (<div className='file-name-cnt'>
    <span className='file-name'>{props.fileName}</span>
  </div>);
}
