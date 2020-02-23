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
    searchText?: string;
}

export class Author extends React.Component<AuthorProps, AuthorState> {
    private searchField: HTMLInputElement;
    constructor(props: AuthorProps) {
        super(props);
        this.state = { isLoading: props.isLoading, author: props.author, authors: props.authors, lineHistory: props.lineHistory };
        this.searchField = null;
    }
    public componentWillReceiveProps(nextProps: AuthorProps): void {
        this.setState({ isLoading: nextProps.isLoading, author: nextProps.author, authors: nextProps.authors, lineHistory: nextProps.lineHistory });
    }
    private onSelect = (branch: string) => {
        const selectedAuthor = branch === '[ALL]' ? '' : branch;
        this.setState({ isLoading: this.state.isLoading });
        this.props.selectAuthor(selectedAuthor.trim());
    }
    private onClick = (e: React.MouseEvent<any, MouseEvent>) => {
        if (e.currentTarget.getAttribute('aria-expanded') === 'false') {
            setTimeout(() => { 
                this.searchField.select();
                this.searchField.focus();
            }, 300);
        }
    }
    
    private getAuthorList() {
        let authors = Array.isArray(this.props.authors) ? this.props.authors : [];
        const selectedAuthor = !this.props.author || this.props.author === '' ? '[ALL]' : this.props.author;

        if (this.state.searchText) {
            authors = authors.filter(x => x.name.toLowerCase().indexOf( this.state.searchText.toLowerCase() ) !== -1);
        }

        return authors.map(author => {
            if (author.name === selectedAuthor) {
                return <MenuItem key={author.name} active eventKey={author.name}>{author.name}</MenuItem>;
            } else {
                return <MenuItem key={author.name} eventKey={author.name}>{author.name}</MenuItem>;
            }
        });
    }

    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchText: e.target.value });
    }

    // tslint:disable-next-line:member-ordering
    public render() {
        if (this.props.lineHistory) {
            return null;
        }
        
        const title = !this.props.author || this.props.author === '' ? 'All Authors' : this.props.author;

        return (<DropdownButton
            bsStyle='primary'
            bsSize='small'
            title={title}
            onSelect={(e) => this.onSelect(e)}
            onClick={(e => this.onClick(e))}
            id='authorSelection'
        >
            <MenuItem eventKey='[ALL]'>All Authors</MenuItem>
            <MenuItem divider />
            <input ref={x => this.searchField = x} type="text" className='textInput' placeholder="Search.." id="myInput" value={this.state.searchText}  onChange={this.handleSearchChange} />
            <MenuItem divider />
            {this.getAuthorList()}
        </DropdownButton>);
    }
}

function mapStateToProps(state: RootState): AuthorState {
    const author = (state && state.settings.authorFilter) ?
        state.settings.authorFilter : '';
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
