import { Disposable } from 'vscode';

export const IDisposableRegistry = Symbol.for('IDisposableRegistry');

export interface IDisposableRegistry extends Disposable {
    register(disposable: Disposable): void;
}
