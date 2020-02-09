// tslint:disable-next-line:no-any
if ((Reflect as any).metadata === undefined) {
    // tslint:disable-next-line:no-require-imports no-var-requires
    require('reflect-metadata');
}

import { Container } from 'inversify';
import * as vscode from 'vscode';
import { Memento, OutputChannel } from 'vscode';
import { registerTypes as registerParserTypes } from './adapter/parsers/serviceRegistry';
import { registerTypes as registerRepositoryTypes } from './adapter/repository/serviceRegistry';
import { registerTypes as registerAdapterTypes } from './adapter/serviceRegistry';
import { registerTypes as registerApplicationTypes } from './application/serviceRegistry';
import { ICommandManager } from './application/types/commandManager';
import { IDisposableRegistry } from './application/types/disposableRegistry';
import { registerTypes as registerCommandFactoryTypes } from './commandFactories/serviceRegistry';
import { registerTypes as registerCommandTypes } from './commandHandlers/serviceRegistry';
import { Logger } from './common/log';
import { ILogService, IUiService } from './common/types';
import { OutputPanelLogger } from './common/uiLogger';
import { UiService } from './common/uiService';
import { gitHistorySchema } from './constants';
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
import { HtmlViewer } from './server/htmlViewer';
import { ServerHost } from './server/serverHost';
import { IServerHost } from './server/types';
import { IGitServiceFactory, IOutputChannel } from './types';
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
    cont.bind<ICommitViewFormatter>(ICommitViewFormatter).to(CommitViewFormatter).inSingletonScope();
    cont.bind<OutputChannel>(IOutputChannel).toConstantValue(getLogChannel());
    cont.bind<Memento>('globalMementoStore').toConstantValue(context.globalState);
    cont.bind<Memento>('workspaceMementoStore').toConstantValue(context.workspaceState);

    registerParserTypes(serviceManager);
    registerRepositoryTypes(serviceManager);
    registerAdapterTypes(serviceManager);
    registerApplicationTypes(serviceManager);
    registerPlatformTypes(serviceManager);
    registerCommandFactoryTypes(serviceManager);
    registerNodeBuilderTypes(serviceManager);
    registerViewerTypes(serviceManager);
    setServiceContainer(serviceContainer);

    const gitServiceFactory = serviceContainer.get<IGitServiceFactory>(IGitServiceFactory);
    serviceManager.addSingletonInstance(IServerHost, new ServerHost(gitServiceFactory, serviceContainer));

    // Register last.
    registerCommandTypes(serviceManager);

    let disposable = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, new ContentProvider(serviceContainer));
    context.subscriptions.push(disposable);
    context.subscriptions.push(serviceManager.get<IDisposableRegistry>(IDisposableRegistry));

    const commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    commandManager.executeCommand('setContext', 'git.commit.view.show', true);
    context.subscriptions.push(new HtmlViewer(serviceContainer));
}
