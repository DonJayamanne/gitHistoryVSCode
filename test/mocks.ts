import { Container } from 'inversify';
import { Abstract, IServiceContainer, IServiceManager, Newable } from '../src/ioc/types';

export class TestServiceContainer implements IServiceContainer, IServiceManager {
    private cont: Container;
    constructor() {
        this.cont = new Container();
    }
    // tslint:disable-next-line:no-any
    public add<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T, name?: string | number | symbol | undefined): void {
        if (name) {
            this.cont.bind<T>(serviceIdentifier).to(constructor).whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    // tslint:disable-next-line:no-any
    public addSingleton<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T, name?: string | number | symbol | undefined): void {
        if (name) {
            this.cont.bind<T>(serviceIdentifier).to(constructor).whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    // tslint:disable-next-line:no-any
    public addSingletonInstance<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, instance: T, name?: string | number | symbol | undefined): void {
        if (name) {
            this.cont.bind<T>(serviceIdentifier).toConstantValue(instance).whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).toConstantValue(instance);
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
