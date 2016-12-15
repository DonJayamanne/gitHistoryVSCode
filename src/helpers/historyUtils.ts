import * as vscode from 'vscode';
import * as parser from '../logParser';
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';

export function getGitPath(): Promise<string> {
    return new Promise((resolve, reject) => {
        let gitPath = <string>vscode.workspace.getConfiguration('git').get('path');
        if (typeof gitPath === 'string' && gitPath.length > 0) {
            resolve(gitPath);
        }

        if (process.platform !== 'win32') {
            // Default: search in PATH environment variable
            resolve('git');
        } else {
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
                (path: string) => resolve(path),
                // fallback: PATH
                (error: any) => resolve('git')
                );
        }
    });
}

export function getGitRepositoryPath(fileName: string): Thenable<string> {

    return getGitPath().then((gitExecutable) =>
        new Promise<string>((resolve, reject) => {
            let options = { cwd: path.dirname(fileName) };

            // git rev-parse --git-dir
            let ls = spawn(gitExecutable, ['rev-parse', '--show-toplevel'], options);

            let log = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                log += data + '\n';
            });

            ls.stderr.on('data', function (data) {
                error += data;
            });

            ls.on('close', function() {
                 if (error.length > 0) {
                    reject(error);
                    return;
                }
                let repositoryPath = log.trim();
                if (!path.isAbsolute(repositoryPath))
                    repositoryPath = path.join(path.dirname(fileName), repositoryPath);
                resolve(repositoryPath);
            });
        })
    );
}

export function getFileHistory(rootDir: string, relativeFilePath: string): Thenable<any[]> {
    return getLog(rootDir, relativeFilePath, ['--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--parents', '--numstat', '--topo-order', '--raw', '--follow', '--', relativeFilePath]);
}
export function getFileHistoryBefore(rootDir: string, relativeFilePath: string, sha1: string, isoStrictDateTime: string): Thenable<any[]> {
    return getLog(rootDir, relativeFilePath, [`--max-count=10`, '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', '--follow', `--before='${isoStrictDateTime}'`, '--', relativeFilePath]);
}

export function getLineHistory(rootDir: string, relativeFilePath: string, lineNumber: number): Thenable<any[]> {
    let lineArgs = '-L' + lineNumber + ',' + lineNumber + ':' + relativeFilePath.replace(/\\/g, '/');
    return getLog(rootDir, relativeFilePath, [lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw']);
}

function getLog(rootDir: string, relativeFilePath: string, args: string[]): Thenable<any[]> {

    return getGitPath().then((gitExecutable) =>
        new Promise<any[]>((resolve, reject) => {
            let options = { cwd: rootDir };
            args.unshift('log');
            let ls = spawn(gitExecutable, args, options);

            let log = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                log += data + '\n';
            });

            ls.stderr.on('data', function (data) {
                error += data;
            });

            ls.on('close', function() {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                let parsedLog = parser.parseLogContents(log);
                resolve(parsedLog);
            });
        }));
}

export function writeFile(rootDir: string, commitSha1: string, sourceFilePath: string, targetFile: string): Thenable<any> {
    return getGitPath().then(
        (gitExecutable) => new Promise((resolve, reject) => {
            let options = { cwd: rootDir };
            let objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
            let ls = spawn(gitExecutable, ['show', objectId], options);

            let error = '';
            ls.stdout.on('data', function (data) {
                fs.appendFileSync(targetFile, data);
            });

            ls.stderr.on('data', function (data) {
                error += data;
            });

            ls.on('close', function() {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                resolve(targetFile);
            });
        }));
}