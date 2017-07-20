import { window } from 'vscode';
import { spawn } from 'child_process';
import { getGitPath, getGitBranch } from './gitPaths';
import { CherryPickEntry } from '../contracts';
import * as logger from '../logger';

export async function CherryPick(rootDir: string, branch: string, sha: string): Promise<CherryPickEntry> {
    const args = ['cherry-pick', sha];
    // This is how you can view the log across all branches
    const gitPath = await getGitPath();
    let newBranch = await getGitBranch(rootDir);

    const yesNo = await window.showQuickPick(['Yes', 'No'], { placeHolder: 'Cherry pick ' + sha.substr(0, 7) + ' into ' + newBranch + '?' });
    return new Promise<CherryPickEntry>((resolve, reject) => {
        const options = { cwd: rootDir };
        if (yesNo === undefined || yesNo === 'No') {
            return;
        }
        if (newBranch === branch) {
            reject('Cannot cherry-pick into same branch (' + newBranch + '). Please checkout a different branch first');
            return;
        }
        let error = '';
        let entry = {} as CherryPickEntry;

        logger.logInfo('git ' + args.join(' '));
        let ls = spawn(gitPath, args, options);

        ls.stdout.setEncoding('utf8');
        ls.stdout.on('data', (data: string) => {
            let m = data.match(/\[(\w+) ([0-9a-z]{7})\]/);
            if (m) {
                entry.branch = m[1];
                entry.sha = m[2];
            }
        });

        ls.stderr.setEncoding('utf8');
        ls.stderr.on('data', (data: string) => {
            error = data;
        });

        ls.on('error', function (error) {
            logger.logError(error);
            reject(error);
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

        logger.logInfo('git ' + args.join(' '));
        let ls = spawn(gitPath, args, options);

        ls.on('error', function (error) {
            logger.logError(error);
            reject(error);
            return;
        });

        ls.on('close', () => {
            resolve();
        });
    });
}