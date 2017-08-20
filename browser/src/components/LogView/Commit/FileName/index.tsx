import * as React from 'react';

interface FileNameProps {
  fileName: string;
  onSelect: () => void;
}

interface FileNameState {
  /* empty */
}

export default function FileName(props: FileNameProps) {
  return (<div className='file-name-cnt'>
    <span className='file-name'>{props.fileName}</span>
  </div>);
}
