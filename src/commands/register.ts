import { commands, Disposable, window } from 'vscode';
// tslint:disable-next-line:no-any
type CommandHandler = (...args: any[]) => any;
// tslint:disable-next-line:no-stateless-class
export class CommandRegister implements Disposable {
    private static disposables: Disposable[] = [];
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

export function command(commandName: string) {
    // tslint:disable-next-line:no-function-expression no-any
    return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<CommandHandler>) {
        // tslint:disable-next-line:no-function-expression
        CommandRegister.register(commandName, async function () {
            try {
                const value = descriptor.value!.call(target, ...Array.from(arguments));
                // If its a promise await the value
                if (value && value.then && value.catch) {
                    await value;
                }
            }
            catch (reason) {
                console.error(`Failed to execute the command ${commandName}`, reason);
                window.showErrorMessage(`Failed to execute the command ${commandName}\n${reason}`);
            }
        });
        return descriptor;
    };
}
