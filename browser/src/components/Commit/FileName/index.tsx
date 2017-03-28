import * as React from 'react';

interface FileNameProps {
  fileName: string;
  onSelect: () => void;
}

interface FileNameState {
  /* empty */
}

class FileName extends React.Component<FileNameProps, FileNameState> {
  render() {
    return <div className='file-name-cnt'>
      <span className='file-name'>{this.props.fileName}</span>
    </div>;
  }
}

export default FileName;
