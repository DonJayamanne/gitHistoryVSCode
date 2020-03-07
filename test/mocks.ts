import { Container } from 'inversify';
import { Abstract, IServiceContainer, IServiceManager, Newable } from '../src/ioc/types';

export class TestServiceContainer implements IServiceContainer, IServiceManager {
    private cont: Container;
    constructor() {
        this.cont = new Container();
    }
    public add<T>(
        serviceIdentifier: string | symbol | Newable<T> | Abstract<T>,
        constructor: new (...args: any[]) => T,
        name?: string | number | symbol | undefined,
    ): void {
        if (name) {
            this.cont
                .bind<T>(serviceIdentifier)
                .to(constructor)
                .whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    public addSingleton<T>(
        serviceIdentifier: string | symbol | Newable<T> | Abstract<T>,
        constructor: new (...args: any[]) => T,
        name?: string | number | symbol | undefined,
    ): void {
        if (name) {
            this.cont
                .bind<T>(serviceIdentifier)
                .to(constructor)
                .whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).to(constructor);
        }
    }
    public addSingletonInstance<T>(
        serviceIdentifier: string | symbol | Newable<T> | Abstract<T>,
        instance: T,
        name?: string | number | symbol | undefined,
    ): void {
        if (name) {
            this.cont
                .bind<T>(serviceIdentifier)
                .toConstantValue(instance)
                .whenTargetNamed(name);
        } else {
            this.cont.bind<T>(serviceIdentifier).toConstantValue(instance);
        }
    }
    public get<T>(
        serviceIdentifier: string | symbol | Newable<T> | Abstract<T>,
        name?: string | number | symbol | undefined,
    ): T {
        return name ? this.cont.getNamed<T>(serviceIdentifier, name) : this.cont.get<T>(serviceIdentifier);
    }
    public getAll<T>(
        serviceIdentifier: string | symbol | Newable<T> | Abstract<T>,
        name?: string | number | symbol | undefined,
    ): T[] {
        return name ? this.cont.getAllNamed<T>(serviceIdentifier, name) : this.cont.getAll<T>(serviceIdentifier);
    }
}
