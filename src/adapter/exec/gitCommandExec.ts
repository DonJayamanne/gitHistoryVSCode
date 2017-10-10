import { spawn } from 'child_process';
import { inject, injectable } from 'inversify';
import { ILogService } from '../../common/types';
import { IGitExecutableLocator } from '../locator';
import { IGitCommandExecutor } from './types';

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    constructor( @inject(IGitExecutableLocator) private gitExecLocator: IGitExecutableLocator,
        @inject(ILogService) private logger: ILogService) {
    }
    public async exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(options: { cwd: string, shell?: boolean }, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: string[]): Promise<string> {
        const gitPath = await this.gitExecLocator.getGitPath();
        const childProcOptions = typeof options === 'string' ? { cwd: options } : options;
        this.logger.log('git', ...args);
        const gitShow = spawn(gitPath, args, childProcOptions);

        const out = gitShow.stdout;
        out.setEncoding('utf8');
        let content: string = '';
        out.on('data', data => content += data);

        return new Promise<string>((resolve, reject) => {
            out.on('end', () => resolve(content));
            out.on('error', reject);
        });
    }
}
