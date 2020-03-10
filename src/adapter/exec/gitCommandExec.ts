import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import { injectable, multiInject } from 'inversify';
import { Writable } from 'stream';
import { extensions } from 'vscode';
import { IGitCommandExecutor } from './types';
import { GitExtension, API } from '../repository/git.d';
import { StopWatch } from '../../common/stopWatch';
import { ILogService } from '../../common/types';

const DEFAULT_ENCODING = 'utf8';
const isWindows = /^win/.test(process.platform);

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    public gitApi: Promise<API>;
    private gitExecutablePath: Promise<string>;

    constructor(@multiInject(ILogService) private loggers: ILogService[]) {
        this.gitApi = new Promise(async resolve => {
            const extension = extensions.getExtension<GitExtension>('vscode.git');
            if (!extension?.isActive) {
                await extension?.activate();
            }
            const api = extension!.exports.getAPI(1);
            // Wait for the API to get initialized.
            api.onDidChangeState(() => {
                if (api.state === 'initialized') {
                    resolve(api);
                }
            });
            if (api.state === 'initialized') {
                resolve(api);
            }
        });
        this.gitExecutablePath = this.gitApi.then(api => api.git.path);
    }
    public exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
    public exec(options: { cwd: string; encoding: 'binary' }, destination: Writable, ...args: string[]): Promise<void>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: any[]): Promise<any> {
        let gitPath = await this.gitExecutablePath;
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

        let stdout: Buffer = new Buffer('');
        let stderr: Buffer = new Buffer('');

        if (binaryOuput) {
            gitShow.stdout.pipe(destination);
        } else {
            gitShow.stdout.on('data', data => {
                stdout = Buffer.concat([stdout, data as Buffer]);
            });
        }

        gitShow.stderr.on('data', data => {
            stderr = Buffer.concat([stderr, data as Buffer]);
        });

        return new Promise<any>((resolve, reject) => {
            gitShow.on('error', reject);
            gitShow.on('close', code => {
                this.loggers.forEach(logger => {
                    logger.log('git', ...args, ` (completed in ${stopWatch.elapsedTime / 1000}s)`);
                });

                if (code === 0) {
                    const stdOut = binaryOuput ? undefined : decode(stdout, childProcOptions.encoding);
                    this.loggers.forEach(logger => {
                        logger.trace(binaryOuput ? '<binary>' : stdout);
                    });
                    resolve(stdOut);
                } else {
                    const stdErr = binaryOuput ? undefined : decode(stderr, childProcOptions.encoding);
                    this.loggers.forEach(logger => {
                        logger.error(stdErr);
                    });
                    reject({ code, error: stdErr });
                }
            });
        });
    }
}

function decode(buffers: Buffer, encoding: string): string {
    return iconv.decode(buffers, encoding);
}
