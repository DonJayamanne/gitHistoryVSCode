import { CommittedFile, Status } from '../../../../definitions';
import * as React from 'react';

interface FileEntryProps {
    committedFile: CommittedFile;
    theme: string;
    onSelect: (CommittedFile) => void;

}

const TotalDiffBlocks = 5;
export class FileEntry extends React.Component<FileEntryProps> {
    onSelect = () => {
        this.props.onSelect(this.props.committedFile);
    }

    renderStatus() {
        let icon = '';
        const theme = this.props.theme.indexOf('dark') >= 0 ? 'dark' : 'light';
        switch (this.props.committedFile.status) {
            case Status.Added:
                icon = 'status-added.svg';
                break;
            case Status.Copied:
                icon = 'status-copied.svg';
                break;
            case Status.Deleted:
                icon = 'status-deleted.svg';
                break;
            case Status.Modified:
                icon = 'status-modified.svg';
                break;
            case Status.Renamed:
                icon = 'status-renamed.svg';
                break;
            default:
                return null;
        }
        const style = {
            marginLeft: '0.3em',
            backgroundImage: `url('icons/${theme}/${icon}')`,
            display: 'inline-block',
            height: '0.9em',
            width: '0.9em',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPositionY: 'bottom',
        };

        return <span style={style} />;
    }
    render() {

        let { additions, deletions } = this.props.committedFile;
        additions = typeof additions === 'number' ? additions : 0;
        deletions = typeof deletions === 'number' ? deletions : 0;
        const summary = `added ${additions} & deleted ${deletions}`;
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

        const oldFile = ''; //this.props.committedFile.oldRelativePath || '';
        const constFileMovementSymbol = ''; //this.props.committedFile.oldRelativePath ? ' => ' : '';

        return (<div className='diff-row'>
            <span className='diff-stats hint--right hint--rounded hint--bounce' aria-label={summary}>
                <span className='diff-count'>{totalDiffs}</span>
                {blocks}
                {this.renderStatus()}
                <div className='file-name-cnt'>
                    <span className='file-name' onClick={this.onSelect}>{oldFile}{constFileMovementSymbol}{this.props.committedFile.relativePath}</span>
                </div>
            </span>
        </div>);
    }
}