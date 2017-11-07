import { Container } from 'inversify';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { registerTypes as registerParserTypes } from './adapter/parsers/serviceRegistry';
import { registerTypes as registerRepositoryTypes } from './adapter/repository/serviceRegistry';
import { registerTypes as registerAdapterTypes } from './adapter/serviceRegistry';
import { GitFileHistoryCommandHandler } from './commands/fileHistory';
import { GitCommitCommandHandler } from './commands/gitCommit';
import { GitHistoryCommandHandler } from './commands/gitHistory';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
import { CommandRegister } from './commands/register';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { IGitCommitCommandHandler, IGitFileHistoryCommandHandler, IGitHistoryCommandHandler } from './commands/types';
import { Logger } from './common/log';
import { ILogService, IUiService } from './common/types';
// import { OutputPanelLogger } from './common/uiLogger';
import { UiService } from './common/uiService';
import { gitHistorySchema } from './constants';
import { CommitViewFormatter } from './formatters/commitFormatter';
import { ICommitViewFormatter } from './formatters/types';
import { ServiceContainer } from './ioc/container';
import { setServiceContainer } from './ioc/index';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { getLogChannel } from './logger';
import { ContentProvider } from './server/contentProvider';
import { ServerHost } from './server/serverHost';
import { StateStore } from './server/stateStore';
import { ThemeService } from './server/themeService';
import { IServerHost, IThemeService, IWorkspaceQueryStateStore } from './server/types';
import { IOutputChannel } from './types';
import { CommitViewer } from './viewers/commitViewer';
import { ICommitViewer } from './viewers/types';

// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    const cont = new Container();
    const serviceManager = new ServiceManager(cont);
    const serviceContainer = new ServiceContainer(cont);

    cont.bind<ILogService>(ILogService).to(Logger).inSingletonScope();
    // cont.bind<ILogService>(ILogService).to(OutputPanelLogger).inSingletonScope().whenTargetNamed('Viewer');
    cont.bind<IGitHistoryCommandHandler>(IGitHistoryCommandHandler).to(GitHistoryCommandHandler);
    cont.bind<IGitFileHistoryCommandHandler>(IGitFileHistoryCommandHandler).to(GitFileHistoryCommandHandler);
    cont.bind<IGitCommitCommandHandler>(IGitCommitCommandHandler).to(GitCommitCommandHandler);
    cont.bind<ICommitViewer>(ICommitViewer).to(CommitViewer);
    cont.bind<IUiService>(IUiService).to(UiService);
    cont.bind<IThemeService>(IThemeService).to(ThemeService);
    cont.bind<ICommitViewFormatter>(ICommitViewFormatter).to(CommitViewFormatter);
    cont.bind<IServerHost>(IServerHost).to(ServerHost).inSingletonScope();
    cont.bind<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore).to(StateStore).inSingletonScope();
    cont.bind<IServiceContainer>(IServiceContainer).toConstantValue(serviceContainer);
    cont.bind<OutputChannel>(IOutputChannel).toConstantValue(getLogChannel());

    registerParserTypes(serviceManager);
    registerRepositoryTypes(serviceManager);
    registerAdapterTypes(serviceManager);

    setServiceContainer(serviceContainer);

    const provider = new ContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
    context.subscriptions.push(registration);

    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
    context.subscriptions.push(serviceContainer.get<IGitHistoryCommandHandler>(IGitHistoryCommandHandler));
    context.subscriptions.push(serviceContainer.get<IGitFileHistoryCommandHandler>(IGitFileHistoryCommandHandler));
    context.subscriptions.push(serviceContainer.get<IGitCommitCommandHandler>(IGitCommitCommandHandler));
    context.subscriptions.push(new CommandRegister());
}
