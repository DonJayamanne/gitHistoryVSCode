import { IClassRequirementDescriptor } from 'tslint/lib/rules/completedDocsRule';
import * as React from 'react';
import Author from '../Author';
const GoX = require('react-icons/lib/go/x');

interface DiffBlockProps {
  fileStat: FileStat;
  onSelect: (ILogEntry) => void;

}

interface DiffBlockState {
  /* empty */
}

const TotalDiffBlocks = 5;
class DiffBlock extends React.Component<DiffBlockProps, DiffBlockState> {
  render() {
    let { additions, deletions } = stat;
    additions = typeof additions === 'number' ? additions : 0;
    deletions = typeof deletions === 'number' ? deletions : 0;
    let totalDiffs = additions + deletions;

    if (totalDiffs > 5) {
      additions = Math.ceil(TotalDiffBlocks * additions / totalDiffs);
      deletions = TotalDiffBlocks - additions;
    }

    additions = typeof additions === 'number' ? additions : 0;
    deletions = typeof deletions === 'number' ? deletions : 0;

    let blocks = new Array(TotalDiffBlocks).fill(0).map((v, index) => {
      let className = 'diff-block ' + (index < additions ? 'added' : 'deleted');
      return <span className={className}></span>;
    });

    let summary = `added ${stat.additions} & deleted ${stat.deletions}`;
    return <span className='diff-stats hint--right hint--rounded hint--bounce' aria-label={summary}>
      <span className='diff-count'>{totalDiffs}</span>
      {blocks}
    </span>;
  }
}

export default DiffBlock;
