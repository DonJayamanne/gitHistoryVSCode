import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ResultActions from '../../actions/results';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Commit from '../../components/LogView/Commit';
import LogView from '../../components/LogView/LogView';
import { ISettings } from '../../definitions';
import { LogEntriesState, RootState } from '../../reducers';

type AppProps = {
    settings: ISettings;
    logEntries: LogEntriesState;
    getCommits: typeof ResultActions.getCommits;
    getPreviousCommits: typeof ResultActions.getPreviousCommits;
    getNextCommits: typeof ResultActions.getNextCommits;
    search: typeof ResultActions.search;
} & typeof ResultActions;

// tslint:disable-next-line:no-empty-interface
interface AppState {
}

class App extends React.Component<AppProps, AppState> {
    // tslint:disable-next-line:no-any
    constructor(props?: AppProps, context?: any) {
        super(props, context);
    }
    // tslint:disable-next-line:no-empty
    public componentWillMount() {
    }
    public render() {
        const { children } = this.props;
        return (
            <div className='appRootParent'>
                <div className='appRoot'>
                    <Header {...this.props }></Header >
                    <LogView logEntries={this.props.logEntries}></LogView>
                    <div id='placeHolderCommit'></div>
                    <Footer
                        canGoBack={this.props.logEntries.pageIndex > 0}
                        canGoForward={(this.props.logEntries.pageIndex + 1) * 100 < this.props.logEntries.count}
                        goBack={this.goBack}
                        goForward={this.goForward}></Footer>
                    {children}
                </div >
                {this.props.logEntries && this.props.logEntries.selected ? <Commit /> : ''}
            </div >
        );
    }
    private goBack = () => {
        this.props.getPreviousCommits();
    }
    private goForward = () => {
        // this.props.fetchData(this.props.logEntries.pageIndex + 1, this.props.logEntries.pageSize);
        this.props.getNextCommits();
    }
}

function mapStateToProps(state: RootState) {
    return {
        settings: state.settings,
        logEntries: state.logEntries
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({ ...ResultActions }, dispatch),
        getCommits: () => dispatch(ResultActions.getCommits()),
        getNextCommits: () => dispatch(ResultActions.getNextCommits()),
        getPreviousCommits: () => dispatch(ResultActions.getPreviousCommits()),
        search: (text: string) => dispatch(ResultActions.search(text))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
