import { CommittedFile } from '../../../../definitions';
import * as React from 'react';
import Author from '../Author';
const GoX = require('react-icons/lib/go/x');

interface FileEntryProps {
    committedFile: CommittedFile;
    onSelect: (CommittedFile) => void;

}

const TotalDiffBlocks = 5;
export class FileEntry extends React.Component<FileEntryProps> {
    onSelect = () => {
        this.props.onSelect(this.props.committedFile);
    }

    render() {
        let { additions, deletions } = this.props.committedFile;
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
            return <span key={index} className={className}></span>;
        });

        let summary = `added ${additions} & deleted ${deletions}`;
        return (<div className='diff-row'>
            <span className='diff-stats hint--right hint--rounded hint--bounce' aria-label={summary}>
                <span className='diff-count'>{totalDiffs}</span>
                {blocks}
                <div className='file-name-cnt'>
                    <span className='file-name' onClick={this.onSelect}>{this.props.committedFile.relativePath}</span>
                </div>
            </span>
        </div>);
    }
}