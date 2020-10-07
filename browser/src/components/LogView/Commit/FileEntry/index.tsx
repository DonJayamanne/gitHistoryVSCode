import { CommittedFile, Status } from '../../../../definitions';
import * as React from 'react';
import { GoEye, GoGitCompare, GoHistory } from 'react-icons/go';

interface FileEntryProps {
    committedFile: CommittedFile;
    theme: string;
    onAction: (CommittedFile, string) => void;
}

const TotalDiffBlocks = 5;
export class FileEntry extends React.Component<FileEntryProps> {
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
            backgroundImage: `url(${window['extensionPath']}/resources/icons/${theme}/${icon})`,
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
        const totalDiffs = additions + deletions;

        if (totalDiffs > 5) {
            additions = Math.ceil((TotalDiffBlocks * additions) / totalDiffs);
            deletions = TotalDiffBlocks - additions;
        }

        additions = typeof additions === 'number' ? additions : 0;
        deletions = typeof deletions === 'number' ? deletions : 0;

        const blocks = new Array(TotalDiffBlocks).fill(0).map((v, index) => {
            const className = 'diff-block ' + (index < additions ? 'added' : 'deleted');
            return <span key={index} className={className}></span>;
        });

        const oldFile = ''; //this.props.committedFile.oldRelativePath || '';
        const constFileMovementSymbol = ''; //this.props.committedFile.oldRelativePath ? ' => ' : '';
        let fileName = this.props.committedFile.relativePath;
        if (fileName.lastIndexOf('/') != -1) {
            fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
        }
        const fileNameClass = fileName == globalThis.fileName ? 'file-name-active' : 'file-name';

        return (
            <div className="diff-row">
                <div>
                    <span className="diff-stats hint--right hint--rounded hint--bounce" aria-label={summary}>
                        {blocks}
                    </span>
                </div>
                <div>{this.renderStatus()}</div>
                <div className="file-name-cnt">
                    <span className={fileNameClass}>
                        {oldFile}
                        {constFileMovementSymbol}
                        {this.props.committedFile.relativePath}
                    </span>
                </div>
                <div className="file-action">
                    <span
                        role="button"
                        className="btnx hint--left hint--rounded hint--bounce"
                        aria-label="View file content"
                    >
                        <a role="button" onClick={() => this.props.onAction(this.props.committedFile, 'view')}>
                            <GoEye></GoEye> View
                        </a>
                    </span>
                    <span
                        role="button"
                        className="btnx hint--left hint--rounded hint--bounce"
                        aria-label="Compare file with current workspace"
                    >
                        <a
                            role="button"
                            onClick={() => this.props.onAction(this.props.committedFile, 'compare_workspace')}
                        >
                            <GoGitCompare></GoGitCompare> Compare with Workspace
                        </a>
                    </span>
                    <span
                        role="button"
                        className="btnx hint--left hint--rounded hint--bounce"
                        aria-label="Compare file with previous commit"
                    >
                        <a
                            role="button"
                            onClick={() => this.props.onAction(this.props.committedFile, 'compare_previous')}
                        >
                            <GoGitCompare></GoGitCompare> Compare with previous
                        </a>
                    </span>
                    <span
                        role="button"
                        className="btnx hint--left hint--rounded hint--bounce"
                        aria-label="View file history"
                    >
                        <a role="button" onClick={() => this.props.onAction(this.props.committedFile, 'history')}>
                            <GoHistory></GoHistory> History
                        </a>
                    </span>
                </div>
            </div>
        );
    }
}
