import { Container, injectable } from 'inversify';
import { ILogService } from '../src/common/types';
import { Abstract, IServiceContainer, IServiceManager, Newable } from '../src/ioc/types';

@injectable()
export class MockLogger implements ILogService {
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        return;
    }
}

export class MockServiceContainer implements IServiceContainer, IServiceManager {
    private cont: Container;
    constructor() {
        this.cont = new Container();
    }
    // tslint:disable-next-line:no-any
    public add<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T, name?: string | number | symbol | undefined): void {
        if (name) {
            this.cont.bind<T>(serviceIdentifier).to(constructor).whenTargetNamed(name);
        }
        else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    // tslint:disable-next-line:no-any
    public addSingleton<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T, name?: string | number | symbol | undefined): void {
        if (name) {
            this.cont.bind<T>(serviceIdentifier).to(constructor).whenTargetNamed(name);
        }
        else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    // tslint:disable-next-line:no-any
    public get<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, name?: string | number | symbol | undefined): T {
        return name ? this.cont.getNamed<T>(serviceIdentifier, name) : this.cont.get<T>(serviceIdentifier);
    }
    // tslint:disable-next-line:no-any
    public getAll<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, name?: string | number | symbol | undefined): T[] {
        return name ? this.cont.getAllNamed<T>(serviceIdentifier, name) : this.cont.getAll<T>(serviceIdentifier);
    }
}
