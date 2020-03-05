import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ResultActions } from '../../actions/results';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Commit from '../../components/LogView/Commit';
import LogView from '../../components/LogView/LogView';
import { ISettings } from '../../definitions';
import { LogEntriesState, RootState } from '../../reducers';
import { IConfiguration } from '../../reducers/vscode';

type AppProps = {
    configuration: IConfiguration;
    settings: ISettings;
    logEntries: LogEntriesState;
    getCommits: typeof ResultActions.getCommits;
    getPreviousCommits: typeof ResultActions.getPreviousCommits;
    getNextCommits: typeof ResultActions.getNextCommits;
    search: typeof ResultActions.search;
} & typeof ResultActions;

interface AppState {
}

class App extends React.Component<AppProps, AppState> {
        constructor(props?: AppProps, context?: any) {
        super(props, context);
    }
    
    public render() {
        const { children } = this.props;
        const canGoForward = this.props.logEntries.count === -1 || (this.props.logEntries.pageIndex + 1) * this.props.configuration.pageSize < this.props.logEntries.count;
        return (
            <div className='appRootParent'>
                <div className='appRoot'>
                    <Header></Header>
                    <LogView logEntries={ this.props.logEntries }></LogView>
                    <Footer
                        canGoBack={ this.props.logEntries.pageIndex > 0 }
                        canGoForward={ canGoForward }
                        goBack={ this.goBack }
                        goForward={ this.goForward }></Footer>
                    { children }
                </div>
                { this.props.logEntries && this.props.logEntries.selected ? <Commit /> : '' }
            </div>
        );
    }
    private goBack = async () => {
        await this.props.getPreviousCommits();
        document.getElementById('scrollCnt').scrollTo(0,0);
    }
    private goForward = async () => {
        await  this.props.getNextCommits();
        document.getElementById('scrollCnt').scrollTo(0,0);
    }
}

function mapStateToProps(state: RootState) {
    return {
        configuration: state.vscode.configuration,
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