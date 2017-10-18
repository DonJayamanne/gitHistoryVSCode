import { Container } from 'inversify';
import * as vscode from 'vscode';
import { registerTypes as registerParserTypes } from './adapter/parsers/serviceRegistry';
import { registerTypes as registerRepositoryTypes } from './adapter/repository/serviceRegistry';
import { registerTypes as registerAdapterTypes } from './adapter/serviceRegistry';
import { GitHistory } from './commands/gitHistory';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
import { CommandRegister } from './commands/register';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { IGitHistoryViewer } from './commands/types';
import { Logger } from './common/log';
import { ILogService, IUiService } from './common/types';
import { UiService } from './common/uiService';
import { gitHistorySchema } from './constants';
import { ServiceContainer } from './ioc/container';
import { setServiceContainer } from './ioc/index';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { ContentProvider } from './server/contentProvider';
import { ServerHost } from './server/serverHost';
import { StateStore } from './server/stateStore';
import { ThemeService } from './server/themeService';
import { IServerHost, IStateStore, IThemeService } from './server/types';

// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    const cont = new Container();
    const serviceManager = new ServiceManager(cont);
    const serviceContainer = new ServiceContainer(cont);

    cont.bind<ILogService>(ILogService).to(Logger).inSingletonScope();
    cont.bind<IGitHistoryViewer>(IGitHistoryViewer).to(GitHistory);
    cont.bind<IUiService>(IUiService).to(UiService);
    cont.bind<IThemeService>(IThemeService).to(ThemeService);
    cont.bind<IServerHost>(IServerHost).to(ServerHost).inSingletonScope();
    cont.bind<IStateStore>(IStateStore).to(StateStore).inSingletonScope();
    cont.bind<IServiceContainer>(IServiceContainer).toConstantValue(serviceContainer);

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
    const logViewer = serviceContainer.get<IGitHistoryViewer>(IGitHistoryViewer);
    context.subscriptions.push(logViewer);
    context.subscriptions.push(new CommandRegister());
}
