import { spawn } from 'child_process';
import getGitPath from './gitPath';

export default async function exec(args: string[], cwd: string, shell?: boolean): Promise<string> {
    const gitPath = await getGitPath();
    let gitShow = spawn(gitPath, args, { cwd, shell });

    let out = gitShow.stdout;
    out.setEncoding('utf8');
    let content: string = '';
    out.on('data', data => content += data);

    return new Promise<string>((resolve, reject) => {
        out.on('end', () => resolve(content));
        out.on('error', err => reject(err));
    });
}
