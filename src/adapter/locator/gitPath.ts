import { exec } from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as logger from '../../logger';
import { IGitExecutableLocator } from './contracts';

export class GitExecutableLocator implements IGitExecutableLocator {
    private gitPath: string;

    public async getGitPath(): Promise<string> {
        if (typeof this.gitPath === 'string') {
            return this.gitPath;
        }

        // tslint:disable-next-line:no-backbone-get-set-outside-model
        this.gitPath = <string>vscode.workspace.getConfiguration('git').get('path');
        if (typeof this.gitPath === 'string' && this.gitPath.length > 0) {
            if (fs.existsSync(this.gitPath)) {
                logger.logInfo(`git path: ${this.gitPath} - from vscode settings`);
                return this.gitPath;
            }
            else {
                logger.logError(`git path: ${this.gitPath} - from vscode settings in invalid`);
            }
        }

        if (process.platform !== 'win32') {
            logger.logInfo('git path: using PATH environment variable');
            return this.gitPath = 'git';
        }

        return this.gitPath = await getGitPathOnWindows();
    }
}

type ErrorEx = Error & { code?: number, stdout?: string, stderr?: string };

function regQueryInstallPath(location: string, view: string | null) {
    return new Promise<string>((resolve, reject) => {
        function callback(error: Error, stdout: string, stderr: string): void {
            if (error && (<ErrorEx>error).code !== 0) {
                (<ErrorEx>error).stdout = stdout.toString();
                (<ErrorEx>error).stderr = stderr.toString();
                reject(error);
            }
            else {
                const match = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i);
                if (match && match[1]) {
                    resolve(`${match[1]}\\bin\\git`);
                } else {
                    reject();
                }
            }
        }

        let viewArg = '';
        switch (view) {
            case '64': viewArg = '/reg:64'; break;
            case '32': viewArg = '/reg:64'; break;
            default: break;
        }

        exec(`reg query ${location} ${viewArg}`, callback);
    });
}

const GitLookupRegistryKeys = [
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: null },   // user keys have precendence over
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: null },   // machine keys
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '64' },   // default view (null) before 64bit view
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '64' },
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '32' },   // last is 32bit view, which will only be checked
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '32' }    // for a 32bit git installation on 64bit Windows
];

function queryChained(locations: { key: string, view: string | null }[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (locations.length === 0) {
            return reject('None of the known git Registry keys were found');
        }

        const location = locations[0];
        return regQueryInstallPath(location.key, location.view)
            .catch(error => queryChained(locations.slice(1)));
    });
}
function getGitPathOnWindows() {
    try {
        const gitRegPath = queryChained(GitLookupRegistryKeys); // for a 32bit git installation on 64bit Windows
        logger.logInfo(`git path: ${gitRegPath} - from registry`);
        return gitRegPath;
    }
    catch (ex) {
        logger.logInfo('git path: falling back to PATH environment variable');
        return 'git';
    }
}
