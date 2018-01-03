import { CommandRegister } from '../src/commands/register';
import { setServiceContainer } from '../src/ioc/index';
import { IServiceContainer } from '../src/ioc/types';

export function suiteSetup() {
    // Remove all handlers.
    new CommandRegister().dispose();
}

export function initializeServiceContainer(container: IServiceContainer) {
    setServiceContainer(container);
}
