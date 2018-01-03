import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import { inject, injectable, multiInject } from 'inversify';
import { EOL } from 'os';
import { Disposable } from 'vscode';
import { ILogService } from '../../common/types';
import { IGitExecutableLocator } from '../locator';
import { IGitCommandExecutor } from './types';

const DEFAULT_ENCODING = 'utf8';

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    constructor( @inject(IGitExecutableLocator) private gitExecLocator: IGitExecutableLocator,
        @multiInject(ILogService) private loggers: ILogService[]) {
    }
    public async exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(options: { cwd: string, shell?: boolean, encoding?: string }, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: string[]): Promise<string> {
        const gitPath = await this.gitExecLocator.getGitPath();
        const childProcOptions = typeof options === 'string' ? { cwd: options, encoding: DEFAULT_ENCODING } : options;
        if (typeof childProcOptions.encoding !== 'string' || childProcOptions.encoding.length === 0) {
            childProcOptions.encoding = DEFAULT_ENCODING;
        }

        const gitShow = spawn(gitPath, args, childProcOptions);

        const disposables: Disposable[] = [];
        const on = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
            ee.on(name, fn);
            disposables.push({ dispose: () => ee.removeListener(name, fn) });
        };

        const buffers: Buffer[] = [];
        on(gitShow.stdout, 'data', (data: Buffer) => buffers.push(data));

        const errBuffers: Buffer[] = [];
        on(gitShow.stderr, 'data', (data: Buffer) => errBuffers.push(data));

        return new Promise<string>((resolve, reject) => {
            gitShow.once('close', () => {
                if (errBuffers.length > 0) {
                    const stdErr = decode(errBuffers, childProcOptions.encoding);
                    this.loggers.forEach(logger => logger.log(`git ${args.join(' ')}${EOL}${stdErr}`));
                    reject(stdErr);
                } else {
                    const stdOut = decode(buffers, childProcOptions.encoding);
                    this.loggers.forEach(logger => logger.log(`git ${args.join(' ')}${EOL}${stdOut}`));
                    resolve(stdOut);
                }
                disposables.forEach(disposable => disposable.dispose());
            });
            gitShow.once('error', ex => {
                reject(ex);
                this.loggers.forEach(logger => logger.log(`git ${args.join(' ')}${EOL}${ex}`));
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
