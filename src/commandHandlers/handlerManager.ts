import { inject, injectable } from 'inversify';
import { ICommandManager } from '../application/types/commandManager';
import { IDisposableRegistry } from '../application/types/disposableRegistry';
import { IServiceContainer } from '../ioc/types';
import { CommandHandlerRegister } from './registration';
import { ICommandHandler, ICommandHandlerManager } from './types';
import { sendTelemetryEvent, sendTelemetryWhenDone } from '../common/telemetry';
import { StopWatch } from '../common/stopWatch';

@injectable()
export class CommandHandlerManager implements ICommandHandlerManager {
    constructor(
        @inject(IDisposableRegistry) private disposableRegistry: IDisposableRegistry,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
    ) {}

    public registerHandlers() {
        for (const item of CommandHandlerRegister.getHandlers()) {
            const serviceIdentifier = item[0];
            const handlers = item[1];
            const target = this.serviceContainer.get<ICommandHandler>(serviceIdentifier);
            handlers.forEach(handlerInfo =>
                this.registerCommand(handlerInfo.commandName, handlerInfo.handlerMethodName, target),
            );
        }
    }

    private registerCommand(commandName: string, handlerMethodName: string, target: ICommandHandler) {
        const handler = target[handlerMethodName] as (...args: any[]) => void;
        const disposable = this.commandManager.registerCommand(commandName, (...args: any[]) => {
            const stopWatch = new StopWatch();
            let result: Promise<any> | undefined | any;
            try {
                result = handler.apply(target, args);
            } finally {
                // Track commands that we have created and attached to, no PII here hence cast `commandName` to any.
                if (result && result.then && typeof result.then === 'function') {
                    // This is an async handler.
                    sendTelemetryWhenDone(commandName as any, result);
                } else {
                    // This is a synchronous handler.
                    sendTelemetryEvent(commandName as any, stopWatch.elapsedTime);
                }
            }
        });
        this.disposableRegistry.register(disposable);
    }
}
