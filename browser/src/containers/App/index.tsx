import * as React from 'react';
import { connect } from 'react-redux';
import { ResultActions } from '../../actions/results';
import Header from '../../components/Header';
import Commit from '../../components/LogView/Commit';
import LogView from '../../components/LogView/LogView';
import { ISettings } from '../../definitions';
import { LogEntriesState, RootState } from '../../reducers';
import { IConfiguration } from '../../reducers/vscode';
import { initialize } from '../../actions/messagebus';

type AppProps = {
    configuration: IConfiguration;
    settings: ISettings;
    logEntries: LogEntriesState;
    dispatch: any;
} & typeof ResultActions;

interface AppState {}

class App extends React.Component<AppProps, AppState> {
    constructor(props?: AppProps, context?: any) {
        super(props, context);

        // @ts-ignore
        initialize(acquireVsCodeApi());

        props.dispatch(ResultActions.getCommits(0, 10));
        props.dispatch(ResultActions.getBranches());
        props.dispatch(ResultActions.getAuthors());
        props.dispatch(ResultActions.fetchAvatars());

        props.dispatch(ResultActions.onStateChanged(this.hasStateChanged.bind(this)));
    }

    public hasStateChanged(requestId: string, data: any) {
        console.log('### STATE HAS CHANGED', requestId, data);
    }

    public render() {
        const { children } = this.props;
        return (
            <div className="appRootParent">
                <div className="appRoot">
                    <Header></Header>
                    <LogView logEntries={this.props.logEntries}></LogView>
                    {children}
                </div>
                {this.props.logEntries && this.props.logEntries.selected ? <Commit /> : ''}
            </div>
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        configuration: state.vscode.configuration,
        settings: state.settings,
        logEntries: state.logEntries,
    };
}

export default connect(mapStateToProps)(App);
