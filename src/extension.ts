// tslint:disable-next-line:no-any
if ((Reflect as any).metadata === undefined) {
    // tslint:disable-next-line:no-require-imports no-var-requires
    require('reflect-metadata');
}
import { Container } from 'inversify';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { registerTypes as registerParserTypes } from './adapter/parsers/serviceRegistry';
import { registerTypes as registerRepositoryTypes } from './adapter/repository/serviceRegistry';
import { registerTypes as registerAdapterTypes } from './adapter/serviceRegistry';
import { registerTypes as registerApplicationTypes } from './application/serviceRegistry';
import { ICommandManager } from './application/types/commandManager';
import { IDisposableRegistry } from './application/types/disposableRegistry';
import { registerTypes as registerCommandFactoryTypes } from './commandFactories/serviceRegistry';
import { registerTypes as registerCommandTypes } from './commandHandlers/serviceRegistry';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
// import { CommandRegister } from './commands/register';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { Logger } from './common/log';
import { ILogService, IUiService } from './common/types';
import { OutputPanelLogger } from './common/uiLogger';
import { UiService } from './common/uiService';
import { gitHistoryFileViewerSchema, gitHistorySchema } from './constants';
import { CommitViewFormatter } from './formatters/commitFormatter';
import { ICommitViewFormatter } from './formatters/types';
import { ServiceContainer } from './ioc/container';
import { setServiceContainer } from './ioc/index';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { getLogChannel } from './logger';
import { registerTypes as registerNodeBuilderTypes } from './nodes/serviceRegistry';
import { registerTypes as registerPlatformTypes } from './platform/serviceRegistry';
import { ContentProvider } from './server/contentProvider';
import { ServerHost } from './server/serverHost';
import { StateStore } from './server/stateStore';
import { ThemeService } from './server/themeService';
import { IServerHost, IThemeService, IWorkspaceQueryStateStore } from './server/types';
import { IOutputChannel } from './types';
import { CommitFileViewerProvider } from './viewers/file/commitFileViewer';
import { registerTypes as registerViewerTypes } from './viewers/serviceRegistry';

let cont: Container;
let serviceManager: ServiceManager;
let serviceContainer: ServiceContainer;

// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    cont = new Container();
    serviceManager = new ServiceManager(cont);
    serviceContainer = new ServiceContainer(cont);

    cont.bind<IServiceContainer>(IServiceContainer).toConstantValue(serviceContainer);

    cont.bind<ILogService>(ILogService).to(Logger).inSingletonScope();
    cont.bind<ILogService>(ILogService).to(OutputPanelLogger).inSingletonScope(); // .whenTargetNamed('Viewer');
    cont.bind<IUiService>(IUiService).to(UiService).inSingletonScope();
    cont.bind<IThemeService>(IThemeService).to(ThemeService).inSingletonScope();
    cont.bind<ICommitViewFormatter>(ICommitViewFormatter).to(CommitViewFormatter).inSingletonScope();
    cont.bind<IServerHost>(IServerHost).to(ServerHost).inSingletonScope();
    cont.bind<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore).to(StateStore).inSingletonScope();
    cont.bind<OutputChannel>(IOutputChannel).toConstantValue(getLogChannel());
    // cont.bind<FileStatParser>(FileStatParser).to(FileStatParser);

    registerParserTypes(serviceManager);
    registerRepositoryTypes(serviceManager);
    registerAdapterTypes(serviceManager);
    registerApplicationTypes(serviceManager);
    registerPlatformTypes(serviceManager);
    registerCommandFactoryTypes(serviceManager);
    registerNodeBuilderTypes(serviceManager);
    registerViewerTypes(serviceManager);

    setServiceContainer(serviceContainer);

    // Register last.
    registerCommandTypes(serviceManager);

    let disposable = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, new ContentProvider());
    context.subscriptions.push(disposable);

    disposable = vscode.workspace.registerTextDocumentContentProvider(gitHistoryFileViewerSchema, new CommitFileViewerProvider(serviceContainer));
    context.subscriptions.push(disposable);
    context.subscriptions.push(serviceManager.get<IDisposableRegistry>(IDisposableRegistry));

    const commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    commandManager.executeCommand('setContext', 'git.commit.view.show', true);

    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
}
