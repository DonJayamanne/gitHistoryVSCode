import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import { injectable, multiInject } from 'inversify';
import { Writable } from 'stream';
import { Disposable, extensions } from 'vscode';
import { IGitCommandExecutor } from './types';
import { GitExtension } from '../repository/git.d';
import { StopWatch } from '../../common/stopWatch';
import { ILogService } from '../../common/types';

const DEFAULT_ENCODING = 'utf8';
const isWindows = /^win/.test(process.platform);

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    public gitExtension: GitExtension;
    private gitExecutablePath: string;

    constructor(@multiInject(ILogService) private loggers: ILogService[]) {
        this.gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;

        const gitApi = this.gitExtension.getAPI(1);
        this.gitExecutablePath = gitApi.git.path;
    }
    public async exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
    public async exec(options: { cwd: string; encoding: 'binary' }, destination: Writable, ...args: string[]): Promise<void>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: any[]): Promise<any> {
        let gitPath = this.gitExecutablePath;
        gitPath = isWindows ? gitPath.replace(/\\/g, '/') : gitPath;
        const childProcOptions = typeof options === 'string' ? { cwd: options, encoding: DEFAULT_ENCODING } : options;
        if (typeof childProcOptions.encoding !== 'string' || childProcOptions.encoding.length === 0) {
            childProcOptions.encoding = DEFAULT_ENCODING;
        }
        const binaryOuput = childProcOptions.encoding === 'binary';
        const destination: Writable = binaryOuput ? args.shift() : undefined;
        const gitPathCommand = childProcOptions.shell && gitPath.indexOf(' ') > 0 ? `"${gitPath}"` : gitPath;
        const stopWatch = new StopWatch();
        const gitShow = spawn(gitPathCommand, args, childProcOptions);
        if (binaryOuput) {
            gitShow.stdout.pipe(destination);
        }
        const disposables: Disposable[] = [];
        const on = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
            ee.on(name, fn);
            disposables.push({ dispose: () => ee.removeListener(name, fn) });
        };

        const buffers: Buffer[] = [];
        if (!binaryOuput) {
            on(gitShow.stdout, 'data', (data: Buffer) => buffers.push(data));
        }
        const errBuffers: Buffer[] = [];
        on(gitShow.stderr, 'data', (data: Buffer) => errBuffers.push(data));

        // tslint:disable-next-line:no-any
        return new Promise<any>((resolve, reject) => {
            gitShow.once('close', () => {
                if (errBuffers.length > 0) {
                    let stdErr = decode(errBuffers, childProcOptions.encoding);
                    stdErr = stdErr.startsWith('error: ') ? stdErr.substring('error: '.length) : stdErr;
                    this.loggers.forEach(logger => {
                        logger.log('git', ...args, ` (completed in ${stopWatch.elapsedTime / 1000}s)`);
                        logger.error(stdErr);
                    });
                    reject(stdErr);
                } else {
                    const stdOut = binaryOuput ? undefined : decode(buffers, childProcOptions.encoding);
                    this.loggers.forEach(logger => {
                        logger.log('git', ...args, ` (completed in ${stopWatch.elapsedTime / 1000}s)`);
                        logger.trace(binaryOuput ? '<binary>' : stdOut);
                    });
                    resolve(stdOut);
                }
                disposables.forEach(disposable => disposable.dispose());
            });
            gitShow.once('error', ex => {
                reject(ex);
                this.loggers.forEach(logger => {
                    logger.log('git', ...args, ` (completed in ${stopWatch.elapsedTime / 1000}s)`);
                    logger.error(ex);
                });
                disposables.forEach(disposable => disposable.dispose());
            });
        });
    }
}

function decode(buffers: Buffer[], encoding: string): string {
    return iconv.decode(Buffer.concat(buffers), encoding);
}