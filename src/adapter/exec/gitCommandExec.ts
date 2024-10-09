import { spawn } from 'child_process';
import { injectable, multiInject } from 'inversify';
import { extensions } from 'vscode';
import { IGitCommandExecutor } from './types';
import { GitExtension, API } from '../repository/git.d';
import { StopWatch } from '../../common/stopWatch';
import { ILogService } from '../../common/types';

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

    // tslint:disable-next-line:no-any
    public async exec(cwd: any, ...args: any[]): Promise<any> {
        let gitPath = await this.gitExecutablePath;
        gitPath = isWindows ? gitPath.replace(/\\/g, '/') : gitPath;

        const stopWatch = new StopWatch();
        const gitShow = spawn(gitPath, args, { cwd: cwd });

        let stdout = '';
        let stderr = '';

        gitShow.stdout.on('data', data => {
            stdout += data;
        });
        gitShow.stderr.on('data', data => {
            stderr += data;
        });

        return new Promise<any>((resolve, reject) => {
            gitShow.on('error', reject);
            gitShow.on('close', code => {
                this.loggers.forEach(logger => {
                    logger.log('git', ...args, ` (completed in ${stopWatch.elapsedTime / 1000}s)`);
                });

                if (code === 0) {
                    this.loggers.forEach(logger => {
                        logger.trace(stdout);
                    });
                    resolve(stdout);
                } else {
                    this.loggers.forEach(logger => {
                        logger.error(stderr);
                    });
                    reject({ code, error: stderr });
                }
            });
        });
    }
}
