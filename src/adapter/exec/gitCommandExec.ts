import { spawn } from 'child_process';
import { IGitExecutableLocator } from '../locator';
import { IGitCommandExecutor } from './types';

export class GitCommandExecutor implements IGitCommandExecutor {
    constructor(private gitExecLocator: IGitExecutableLocator) {
    }
    public async exec(args: string[], cwd: string): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    public async exec(args: string[], options: { cwd: string, shell?: boolean }): Promise<string>;
    // tslint:disable-next-line:no-any
    public async exec(args: string[], options: any): Promise<string> {
        const gitPath = await this.gitExecLocator.getGitPath();
        const childProcOptions = typeof options === 'string' ? { cwd: options } : options;
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
