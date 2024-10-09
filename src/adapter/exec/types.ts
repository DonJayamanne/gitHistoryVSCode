import { API } from '../repository/git.d';

export const IGitCommandExecutor = Symbol.for('IGitCommandExecutor');

export interface IGitCommandExecutor {
    readonly gitApi: Promise<API>;
    exec(cwd: string, ...args: string[]): Promise<any>;
}
