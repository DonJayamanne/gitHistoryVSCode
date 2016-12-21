import * as vscode from 'vscode';
import { spawn, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as logger from '../logger';

let gitPath: string;

export async function getGitPath(): Promise<string> {
    if (gitPath !== undefined) {
        return Promise.resolve(gitPath);
    }
    return new Promise<string>((resolve, reject) => {
        const gitPathConfig = <string>vscode.workspace.getConfiguration('git').get('path');
        if (typeof gitPathConfig === 'string' && gitPathConfig.length > 0) {
            if (fs.exists(gitPathConfig)) {
                logger.logInfo(`git path: ${gitPathConfig} - from vscode settings`);
                gitPath = gitPathConfig;
                resolve(gitPathConfig);
                return;
            }
            else {
                logger.logError(`git path: ${gitPathConfig} - from vscode settings in invalid`);
            }
        }

        if (process.platform !== 'win32') {
            logger.logInfo(`git path: using PATH environment variable`);
            gitPath = 'git';
            resolve('git');
            return;
        }
        else {
            // in Git for Windows, the recommendation is not to put git into the PATH.
            // Instead, there is an entry in the Registry.
            let regQueryInstallPath: (location: string, view: string | null) => Promise<string> = (location, view) => {
                return new Promise((resolve, reject) => {
                    let callback = function (error: any, stdout: any, stderr: any) {
                        if (error && error.code !== 0) {
                            error.stdout = stdout.toString();
                            error.stderr = stderr.toString();
                            reject(error);
                            return;
                        }

                        let installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i)[1];
                        if (installPath) {
                            resolve(installPath + '\\bin\\git');
                        } else {
                            reject();
                        }
                    };

                    let viewArg = '';
                    switch (view) {
                        case '64': viewArg = '/reg:64'; break;
                        case '32': viewArg = '/reg:64'; break;
                        default: break;
                    }

                    exec('reg query ' + location + ' ' + viewArg, callback);
                });
            };

            let queryChained: (locations: { key: string, view: string | null}[]) => Promise<string> = (locations) => {
                return new Promise<string>((resolve, reject) => {
                    if (locations.length === 0) {
                        reject('None of the known git Registry keys were found');
                        return;
                    }

                    let location = locations[0];
                    regQueryInstallPath(location.key, location.view).then(
                        (location) => resolve(location),
                        (error) => queryChained(locations.slice(1)).then(
                            (location) => resolve(location),
                            (error) => reject(error)
                        )
                    );
                });
            };

            queryChained([
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': null },     // user keys have precendence over
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': null },     // machine keys
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '64' },   // default view (null) before 64bit view
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '32' },   // last is 32bit view, which will only be checked
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '32' }]). // for a 32bit git installation on 64bit Windows
                then(
                (path: string) => {
                    logger.logInfo(`git path: ${path} - from registry`);
                    gitPath = path;
                    resolve(path);
                },
                (error: any) => {
                    logger.logInfo(`git path: falling back to PATH environment variable`);
                    gitPath = 'git';
                    resolve('git');
                });
        }
    });
}

export async function getGitRepositoryPath(fileName: string): Promise<string> {
    const gitPath = await getGitPath();
    return new Promise<string>((resolve, reject) => {
        const directory = fs.statSync(fileName).isDirectory() ? fileName : path.dirname(fileName);
        const options = { cwd: directory };
        const args = ['rev-parse', '--show-toplevel'];

        logger.logInfo('git ' + args.join(' '));
        let ls = spawn(gitPath, args, options);

        let repoPath = '';
        let error = '';
        ls.stdout.on('data', function (data) {
            repoPath += data + '\n';
        });

        ls.stderr.on('data', function (data) {
            error += data;
        });

        ls.on('error', function(error) {
            logger.logError(error);
            reject(error);
            return;
        });

        ls.on('close', function() {
            if (error.length > 0) {
                logger.logError(error);
                reject(error);
                return;
            }
            let repositoryPath = repoPath.trim();
            if (!path.isAbsolute(repositoryPath)) {
                repositoryPath = path.join(path.dirname(fileName), repositoryPath);
            }
            logger.logInfo('git repo path: ' + repositoryPath);
            resolve(repositoryPath);
        });
    });
}
