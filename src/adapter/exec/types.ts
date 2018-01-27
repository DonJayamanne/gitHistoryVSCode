import { Writable } from 'stream';

export const IGitCommandExecutor = Symbol('IGitCommandExecutor');

export interface IGitCommandExecutor {
    exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
    exec(options: { cwd: string; shell?: boolean; encoding: 'binary' }, destination: Writable, ...args: string[]): Promise<void>;
}
