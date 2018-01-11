import { Disposable } from 'vscode';

export const IDisposableRegistry = Symbol('IDisposableRegistry');

export interface IDisposableRegistry extends Disposable {
    register(disposable: Disposable): void;
}
