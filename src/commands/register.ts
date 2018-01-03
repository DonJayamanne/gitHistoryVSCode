import { interfaces } from 'inversify';
import { commands, Disposable, window } from 'vscode';
import { createDeferred } from '../common/helpers';
import { Deferred } from '../common/promiseHelper';
import { getServiceContainer } from '../ioc/index';

// tslint:disable-next-line:no-any
type CommandHandler = (...args: any[]) => any;
// tslint:disable-next-line:no-stateless-class
export class CommandRegister implements Disposable {
    private static disposables: Disposable[] = [];
    private static _deferred?: Deferred<void>;
    public static get initialized(): Promise<void> {
        if (!CommandRegister._deferred) {
            CommandRegister._deferred = createDeferred<void>();
        }
        return CommandRegister._deferred.promise;
    }
    // tslint:disable-next-line:function-name
    public static initialize() {
        if (!CommandRegister._deferred) {
            CommandRegister._deferred = createDeferred<void>();
        }
        CommandRegister._deferred.resolve();
    }
    // tslint:disable-next-line:no-any function-name
    public static register(commandName: string, handler: CommandHandler) {
        const disposable = commands.registerCommand(commandName, handler);
        CommandRegister.disposables.push(disposable);
    }
    public dispose() {
        CommandRegister.disposables.forEach(disposable => disposable.dispose());
        CommandRegister.disposables = [];
    }
}
// const container = getDiContainer();

// tslint:disable-next-line:no-any function-name
export function command(commandName: string, serviceIdentifier: interfaces.ServiceIdentifier<any>) {
    // tslint:disable-next-line:no-function-expression no-any
    return function (_target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<CommandHandler>) {
        CommandRegister.initialized.then(() => {
            // tslint:disable-next-line:no-function-expression
            CommandRegister.register(commandName, async function () {
                try {
                    // hack hack (but this preserves context)
                    const container = getServiceContainer();
                    const newTarget = container.get(serviceIdentifier) as { propertyKey: Function };
                    const value = newTarget[propertyKey].call(newTarget, ...Array.from(arguments));
                    // const value = descriptor.value!.call(target, ...Array.from(arguments));
                    // If its a promise await the value
                    if (value && value.then && value.catch) {
                        await value;
                    }
                } catch (reason) {
                    console.error(`Failed to execute the command ${commandName}`, reason);
                    window.showErrorMessage(`Failed to execute '${commandName}'. ${reason}`);
                }
            });
        });
        return descriptor;
    };
}
