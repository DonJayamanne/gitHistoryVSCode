import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as iconv from 'iconv-lite';
import { inject, injectable, multiInject } from 'inversify';
import * as path from 'path';
import { Writable } from 'stream';
import { Disposable } from 'vscode';
import { StopWatch } from '../../common/stopWatch';
import { ILogService } from '../../common/types';
import { IGitExecutableLocator } from '../locator';
import { IGitCommandExecutor } from './types';

const DEFAULT_ENCODING = 'utf8';
const isWindows = /^win/.test(process.platform);

async function getExistedDir(filePath: string): Promise<string> {
    let currentPath = filePath;
    try {
        const stat = await fs.stat(currentPath);
        if (stat.isDirectory()) {
            return currentPath;
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    do {
        currentPath = path.dirname(currentPath);
    } while (!await fs.pathExists(currentPath));
    return currentPath;
}

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    constructor( @inject(IGitExecutableLocator) private gitExecLocator: IGitExecutableLocator,
        @multiInject(ILogService) private loggers: ILogService[]) {
    }
    public async exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
    public async exec(options: { cwd: string; encoding: 'binary' }, destination: Writable, ...args: string[]): Promise<void>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: any[]): Promise<any> {
        let gitPath = await this.gitExecLocator.getGitPath();
        gitPath = isWindows ? gitPath.replace(/\\/g, '/') : gitPath;
        const childProcOptions = typeof options === 'string' ? { cwd: options, encoding: DEFAULT_ENCODING } : options;
        if (typeof childProcOptions.encoding !== 'string' || childProcOptions.encoding.length === 0) {
            childProcOptions.encoding = DEFAULT_ENCODING;
        }
        const binaryOuput = childProcOptions.encoding === 'binary';
        const destination: Writable = binaryOuput ? args.shift()! : undefined;
        const gitPathCommand = childProcOptions.shell && gitPath.indexOf(' ') > 0 ? `"${gitPath}"` : gitPath;
        const stopWatch = new StopWatch();
        // spawn will throw "Error: spawn xx ENOENT" if cwd is not exist
        // and "Error: ENOTDIR" if cwd is not a directory
        if (childProcOptions.cwd) {
           childProcOptions.cwd = await getExistedDir(childProcOptions.cwd);
        }
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

// import { spawn } from 'child_process';
// import * as iconv from 'iconv-lite';
// import { inject, injectable, multiInject } from 'inversify';
// import { ILogService } from '../../common/types';
// import { IGitExecutableLocator } from '../locator';
// import { IGitCommandExecutor } from './types';

// @injectable()
// export class GitCommandExecutor implements IGitCommandExecutor {
//     constructor( @inject(IGitExecutableLocator) private gitExecLocator: IGitExecutableLocator,
//         @multiInject(ILogService) private loggers: ILogService[]) {
//     }
//     public async exec(cwd: string, ...args: string[]): Promise<string>;
//     // tslint:disable-next-line:unified-signatures
//     public async exec(options: { cwd: string, shell?: boolean, encoding?: string }, ...args: string[]): Promise<string>;
//     // tslint:disable-next-line:no-any
//     public async exec(options: any, ...args: string[]): Promise<string> {
//         const gitPath = await this.gitExecLocator.getGitPath();
//         const childProcOptions = typeof options === 'string' ? { cwd: options } : options;
//         const encoding = childProcOptions.encoding || 'utf8';

//         childProcOptions.encoding = encoding === 'utf8' ? 'utf8' : undefined;
//         this.loggers.forEach(logger => logger.log(`git ${args.join(' ')}`));
//         const gitShow = spawn(gitPath, args, childProcOptions);

//         // Best to use iconv-lite
//         // https://github.com/DonJayamanne/pythonVSCode/issues/861

//         const out = gitShow.stdout;
//         // if (childProcOptions.encoding) {
//         //     out.setEncoding(childProcOptions.encoding);
//         // } else {
//         if (encoding === 'utf8') {
//             out.setEncoding('utf8');
//         }
//         // }

//         const buffer: (Buffer | string)[] = [];
//         // let content: string = '';
//         out.on('data', data => buffer.push(data));

//         return new Promise<string>((resolve, reject) => {
//             gitShow.on('close', () => {
//                 if (encoding === 'utf8') {
//                     resolve(buffer.join(''));
//                 } else {
//                     // tslint:disable-next-line:no-any
//                     const netBuffer = Buffer.concat(buffer as any as Buffer[]);
//                     const content = iconv.decode(netBuffer, encoding);
//                     resolve(content);
//                 }
//             });
//             gitShow.on('error', reject);
//         });
//     }
// }

// git log --name-status --full-history -M --format="%H -%nauthor %an%nauthor-date %at%nparents %P%nsummary %B%nfilename ?" -m -n1 905c713de0eaa7001e7191bf887665bcbbf3ed74
