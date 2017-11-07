import { spawn } from 'child_process';
import { inject, injectable, multiInject } from 'inversify';
import { ILogService } from '../../common/types';
import { IGitExecutableLocator } from '../locator';
import { IGitCommandExecutor } from './types';

@injectable()
export class GitCommandExecutor implements IGitCommandExecutor {
    constructor( @inject(IGitExecutableLocator) private gitExecLocator: IGitExecutableLocator,
        @multiInject(ILogService) private loggers: ILogService[]) {
    }
    public async exec(cwd: string, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(options: { cwd: string, shell?: boolean }, ...args: string[]): Promise<string>;
    // tslint:disable-next-line:no-any
    public async exec(options: any, ...args: string[]): Promise<string> {
        const gitPath = await this.gitExecLocator.getGitPath();
        const childProcOptions = typeof options === 'string' ? { cwd: options } : options;
        this.loggers.forEach(logger => logger.log(`git ${args.join(' ')}`));
        const gitShow = spawn(gitPath, args, childProcOptions);

        const out = gitShow.stdout;
        out.setEncoding('utf8');
        let content: string = '';
        out.on('data', data => content += data);

        return new Promise<string>((resolve, reject) => {
            gitShow.on('close', () => resolve(content));
            gitShow.on('error', reject);
        });
    }
}
