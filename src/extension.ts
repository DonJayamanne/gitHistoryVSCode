// This line should always be right on top.
// Other extensions use this, re-importing will cause data stored by this to wipe out data in other extensions using this same package.
if ((Reflect as any).metadata === undefined) {
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
import { CommitViewFormatter } from './formatters/commitFormatter';
import { ICommitViewFormatter } from './formatters/types';
import { ServiceContainer } from './ioc/container';
import { setServiceContainer } from './ioc/index';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { getLogChannel } from './logger';
import { registerTypes as registerNodeBuilderTypes } from './nodes/serviceRegistry';
import { registerTypes as registerPlatformTypes } from './platform/serviceRegistry';
import { HtmlViewer } from './server/htmlViewer';
import { IGitServiceFactory, IOutputChannel } from './types';
import { registerTypes as registerViewerTypes } from './viewers/serviceRegistry';
import { getTelemetryReporter, sendTelemetryEvent } from './common/telemetry';
import { StopWatch } from './common/stopWatch';
import { extensionRoot } from './constants';

let cont: Container;
let serviceManager: ServiceManager;
let serviceContainer: ServiceContainer;

export async function activate(context: vscode.ExtensionContext): Promise<any> {
    extensionRoot.path = context.extensionPath;
    const stopwatch = new StopWatch();
    const telemetryReporter = getTelemetryReporter();
    if (telemetryReporter) {
        context.subscriptions.push(telemetryReporter);
    }
    cont = new Container();
    serviceManager = new ServiceManager(cont);
    serviceContainer = new ServiceContainer(cont);

    cont.bind<IServiceContainer>(IServiceContainer).toConstantValue(serviceContainer);

    cont.bind<ILogService>(ILogService)
        .to(Logger)
        .inSingletonScope();
    cont.bind<ILogService>(ILogService)
        .to(OutputPanelLogger)
        .inSingletonScope(); // .whenTargetNamed('Viewer');
    cont.bind<IUiService>(IUiService)
        .to(UiService)
        .inSingletonScope();
    cont.bind<ICommitViewFormatter>(ICommitViewFormatter)
        .to(CommitViewFormatter)
        .inSingletonScope();
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

    // Register last.
    registerCommandTypes(serviceManager);

    context.subscriptions.push(serviceManager.get<IDisposableRegistry>(IDisposableRegistry));
    context.subscriptions.push(serviceManager.get<IDisposableRegistry>(IDisposableRegistry));

    const commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    commandManager.executeCommand('setContext', 'git.commit.view.show', true);
    context.subscriptions.push(new HtmlViewer(serviceContainer, gitServiceFactory, context.extensionPath));

    sendTelemetryEvent('ACTIVATED', stopwatch.elapsedTime);

    // When running tests, we need access to DI Container.
    if (process.env.IS_TEST_MODE) {
        return { serviceManager };
    }
}
