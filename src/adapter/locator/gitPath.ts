import { exec } from 'child_process';
import * as fs from 'fs';
import { inject, injectable, multiInject } from 'inversify';
import * as vscode from 'vscode';
import { ILogService } from '../../common/types';
import { IPlatformService } from '../../platform/types';
import { IGitExecutableLocator } from './types';

@injectable()
export class GitExecutableLocator implements IGitExecutableLocator {
    private gitPath: string;
    constructor( @multiInject(ILogService) private loggers: ILogService[],
        @inject(IPlatformService) private platformService: IPlatformService) {
    }
    public async getGitPath(): Promise<string> {
        if (typeof this.gitPath === 'string') {
            return this.gitPath;
        }

        // tslint:disable-next-line:no-backbone-get-set-outside-model
        this.gitPath = <string>vscode.workspace.getConfiguration('git').get('path');
        if (typeof this.gitPath === 'string' && this.gitPath.length > 0) {
            if (fs.existsSync(this.gitPath)) {
                this.loggers.forEach(logger => logger.trace(`git path: ${this.gitPath} - from vscode settings`));
                return this.gitPath;
            } else {
                this.loggers.forEach(logger => logger.error(`git path: ${this.gitPath} - from vscode settings in invalid`));
            }
        }

        if (!this.platformService.isWindows) {
            this.loggers.forEach(logger => logger.trace('git path: using PATH environment variable'));
            return this.gitPath = 'git';
        }

        this.gitPath = await getGitPathOnWindows(this.loggers);
        this.loggers.forEach(logger => logger.log('git path identified as: ', this.gitPath));
        return this.gitPath;
    }
}

type ErrorEx = Error & { code?: number, stdout?: string, stderr?: string };

async function regQueryInstallPath(location: string, view: string | null) {
    return new Promise<string>((resolve, reject) => {
        function callback(error: Error, stdout: string, stderr: string): void {
            if (error && (<ErrorEx>error).code !== 0) {
                (<ErrorEx>error).stdout = stdout.toString();
                (<ErrorEx>error).stderr = stderr.toString();
                reject(error);
            } else {
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

async function queryChained(locations: { key: string; view: string | null }[]): Promise<string> {
    if (locations.length === 0) {
        return Promise.reject('None of the known git Registry keys were found');
    }

    const location = locations[0];
    return regQueryInstallPath(location.key, location.view)
        .catch(async () => queryChained(locations.slice(1)));
}
async function getGitPathOnWindows(loggers: ILogService[]) {
    try {
        // return 'git';
        const gitRegPath = await queryChained(GitLookupRegistryKeys); // for a 32bit git installation on 64bit Windows
        loggers.forEach(logger => logger.trace(`git path: ${gitRegPath} - from registry`));
        return gitRegPath;
    } catch (ex) {
        loggers.forEach(logger => logger.trace('git path: falling back to PATH environment variable'));
        return 'git';
    }
}
