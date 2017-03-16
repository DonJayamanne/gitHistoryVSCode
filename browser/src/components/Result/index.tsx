import * as React from 'react';
import { richestMimetype, transforms } from 'transformime-react';
import JSONTree from 'react-json-tree';

const Immutable: any = require('immutable');
interface ResultListProps {
  result: NotebookOutput;
}

interface ResultListState {
  /* empty */
}

class ResultList extends React.Component<ResultListProps, ResultListState> {
  render() {
    let data = this.props.result.value;
    if (data && data['application/json']) {
      return <JSONTree data={data['application/json']} />;
    }

    // Jupyter style MIME bundle
    const bundle = new Immutable.Map(data);
    // Find out which mimetype is the richest
    const mimetype: string = richestMimetype(bundle);
    // Get the matching React.Component for that mimetype
    let Transform = transforms.get(mimetype);

    if (typeof mimetype !== 'string') {
      return <div>Unknown Mime Type</div>;
    }
    // If dealing with images, set the background color to white
    let style = {};
    if (mimetype.startsWith('image')) {
      style['backgroundColor'] = 'white';
    }
    if (mimetype === 'text/plain') {
      style['white-space'] = 'pre';
    }
    return <div style={style}><Transform data={bundle.get(mimetype)} /></div>;
  }
}

export default ResultList;
