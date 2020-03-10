import { Writable } from 'stream';
import { GitExtension } from '../repository/git.d';

export const IGitCommandExecutor = Symbol.for('IGitCommandExecutor');

export interface IGitCommandExecutor {
    gitExtension: GitExtension;
    exec(cwd: string, ...args: string[]): Promise<string>;
    exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
    exec(
        options: { cwd: string; shell?: boolean; encoding: 'binary' },
        destination: Writable,
        ...args: string[]
    ): Promise<void>;
}
