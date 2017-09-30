import { spawn } from 'child_process';
import { window } from 'vscode';
import * as logger from '../logger';
import { CherryPickEntry } from '../types';
import { getGitBranch, getGitPath } from './gitPaths';

export async function CherryPick(rootDir: string, branch: string, hash: string): Promise<CherryPickEntry> {
    const args = ['cherry-pick', hash];
    // This is how you can view the log across all branches
    const gitPath = await getGitPath();
    const newBranch = await getGitBranch(rootDir);

    const yesNo = await window.showQuickPick(['Yes', 'No'], { placeHolder: `Cherry pick ${hash.substr(0, 7)} into ${newBranch}?` });
    return new Promise<CherryPickEntry>((resolve, reject) => {
        const options = { cwd: rootDir };
        if (yesNo === undefined || yesNo === 'No') {
            return;
        }
        if (newBranch === branch) {
            reject(`Cannot cherry-pick into same branch (${newBranch}). Please checkout a different branch first`);
            return;
        }
        let error = '';
        const entry = {} as CherryPickEntry;

        logger.logInfo(`git ${args.join(' ')}`);
        const ls = spawn(gitPath, args, options);

        ls.stdout.setEncoding('utf8');
        ls.stdout.on('data', (data: string) => {
            const m = data.match(/\[(\w+) ([0-9a-z]{7})\]/);
            if (m) {
                entry.branch = m[1];
                entry.hash = m[2];
            }
        });

        ls.stderr.setEncoding('utf8');
        ls.stderr.on('data', (data: string) => {
            error = data;
        });

        ls.on('error', err => {
            logger.logError(err);
            reject(err);
            return;
        });

        ls.on('close', () => {
            if (error.length > 0 || entry.branch.length <= 0) {
                CherryPickAbort(rootDir);
                reject(error);
                return;
            }
            resolve(entry);
        });
    });
}

export async function CherryPickAbort(rootDir: string): Promise<null> {
    const args = ['cherry-pick', '--abort'];
    // This is how you can view the log across all branches
    const gitPath = await getGitPath();

    return new Promise<null>((resolve, reject) => {
        const options = { cwd: rootDir };

        logger.logInfo(`git ${args.join(' ')}`);
        const ls = spawn(gitPath, args, options);

        ls.on('error', (err) => {
            logger.logError(err);
            reject(err);
            return;
        });

        ls.on('close', () => {
            resolve();
        });
    });
}
