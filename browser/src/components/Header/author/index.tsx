import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as ResultActions from '../../../actions/results';
import { AuthorsState, RootState } from '../../../reducers/index';

interface AuthorProps {
    isLoading?: boolean;
    author?: string;
    authors?: AuthorsState;
    lineHistory: boolean;
    selectAuthor(author: string): void;
}

interface AuthorState {
    isLoading?: boolean;
    author?: string;
    lineHistory: boolean;
    authors?: AuthorsState;
}

export class Author extends React.Component<AuthorProps, AuthorState> {
    constructor(props: AuthorProps) {
        super(props);
        this.state = { isLoading: props.isLoading, author: props.author, authors: props.authors, lineHistory: props.lineHistory };
    }
    public componentWillReceiveProps(nextProps: AuthorProps): void {
        this.setState({ isLoading: nextProps.isLoading, author: nextProps.author, authors: nextProps.authors, lineHistory: nextProps.lineHistory });
    }
    private onSelect = (branch: string) => {
        const selectedBranch = branch === '[ALL]' ? '' : branch;
        this.setState({ isLoading: this.state.isLoading });
        this.props.selectAuthor(selectedBranch.trim());
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        if (this.props.lineHistory) {
            return null;
        }
        
        const title = !this.props.author || this.props.author === '' ? 'All Authors' : this.props.author;
        const selectedAuthor = !this.props.author || this.props.author === '' ? '[ALL]' : this.props.author;
        const authors = Array.isArray(this.props.authors) ? this.props.authors : [];
        const authorList = authors.map(author => {
            if (author.name === selectedAuthor) {
                return <MenuItem key={author.name} active eventKey={author.name}>{author.name}</MenuItem>;
            } else {
                return <MenuItem key={author.name} eventKey={author.name}>{author.name}</MenuItem>;
            }
        });

        return (<DropdownButton
            bsStyle='primary'
            bsSize='small'
            title={title}
            key={selectedAuthor}
            onSelect={this.onSelect}
            id='authorSelection'
        >
            <MenuItem eventKey='[ALL]'>All Authors</MenuItem>
            <MenuItem divider />
            {authorList}
        </DropdownButton>);
    }
}

function mapStateToProps(state: RootState): AuthorState {
    const author = (state && state.logEntries.author) ?
        state.logEntries.author : '';
    const authors = (state && state.authors) ?
        state.authors : [];
    const isLoading = state && state.logEntries && state.logEntries.isLoading;
    const lineHistory = state && typeof state.logEntries.lineNumber === 'number';

    return {
        isLoading,
        author,
        authors,
        lineHistory
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectAuthor: (text: string) => dispatch(ResultActions.selectAuthor(text))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Author);
