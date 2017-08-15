import { spawn } from 'child_process';
import getGitPath from './gitPath';

export class GitExec {
    constructor(private workspaceRootPath: string) {

    }

    private gitRootPath: string;

    public async  getGitRoot(): Promise<string> {
        if (!this.gitRootPath) {
            const gitRootPath = await this.exec(['rev-parse', '--show-toplevel'], this.workspaceRootPath);
            this.gitRootPath = gitRootPath.trim();
        }
        return this.gitRootPath;
    }

    public async  exec(args: string[], cwd?: string): Promise<string> {
        if (!cwd) {
            cwd = await this.getGitRoot();
        }
        const gitPath = await getGitPath();
        let gitShow = spawn(gitPath, args, { cwd });

        let out = gitShow.stdout;
        out.setEncoding('utf8');
        let content: string = '';
        out.on('data', data => content += data);

        return new Promise<string>((resolve, reject) => {
            out.on('end', () => resolve(content));
            out.on('error', err => reject(err));
        });
    }
}