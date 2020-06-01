import * as React from 'react';
import { connect } from 'react-redux';
import { ResultActions } from '../../actions/results';
import SplitPane from 'react-split-pane';
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

interface AppState { }

class App extends React.Component<AppProps, AppState> {
    private splitPane;
    private prevSplitterPos;

    constructor(props?: AppProps, context?: any) {
        super(props, context);

        initialize(window['vscode']);

        props.dispatch(ResultActions.getCommits(0, 30));
        props.dispatch(ResultActions.getBranches());
        props.dispatch(ResultActions.getAuthors());
        props.dispatch(ResultActions.fetchAvatars());

        props.dispatch(ResultActions.onStateChanged(this.hasStateChanged.bind(this)));

        this.splitPane = React.createRef();
        this.prevSplitterPos = '50%';
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.logEntries.selected != prevProps.logEntries.selected) {
            if (!this.props.logEntries.selected) {
                this.prevSplitterPos = this.props.configuration.sideBySide
                    ? this.splitPane.current.pane1.style.width
                    : this.splitPane.current.pane1.style.height;
                if (this.props.configuration.sideBySide) this.splitPane.current.pane1.style.width = '100%';
                else this.splitPane.current.pane1.style.height = '100%';
            } else {
                if (this.props.configuration.sideBySide)
                    this.splitPane.current.pane1.style.width = this.prevSplitterPos;
                else this.splitPane.current.pane1.style.height = this.prevSplitterPos;
            }
        }
    }

    onSplitterChanged(s) {
        this.prevSplitterPos = s;
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
                    <SplitPane
                        ref={this.splitPane}
                        split={this.props.configuration.sideBySide ? 'vertical' : 'horizontal'}
                        onChange={this.onSplitterChanged.bind(this)}
                        pane1Style={{ overflowY: 'auto' }}
                        defaultSize="100%"
                        style={{ paddingTop: '40px' }}
                        primary="first"
                    >
                        <LogView logEntries={this.props.logEntries} configuration={this.props.configuration}></LogView>
                        {this.props.logEntries && this.props.logEntries.selected ? (
                            <Commit />
                        ) : (
                            <div className="detail-view-info">
                                <div>Pick a commit from the list to view details</div>
                            </div>
                        )}
                    </SplitPane>
                </div>
                {children}
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
