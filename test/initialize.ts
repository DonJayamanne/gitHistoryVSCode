import { CacheRegister } from '../src/common/cache';
import { setServiceContainer } from '../src/ioc/index';
import { IServiceContainer } from '../src/ioc/types';

export function suiteSetup() {
    new CacheRegister().dispose();
}

export function initializeServiceContainer(container: IServiceContainer) {
    setServiceContainer(container);
}
