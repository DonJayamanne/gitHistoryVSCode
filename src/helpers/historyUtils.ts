import * as vscode from 'vscode';
import * as parser from '../logParser';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';


function getGitExecutable(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') {
            // Default: search in PATH environment variable
            resolve('git');
        } else {
            // in Git for Windows, the recommendation is not to put git into the PATH.
            // Instead, there is an entry in the Registry.
            
            let regQueryInstallPath: (location: string, view: string) => Promise<string> = (location, view) => {
                return new Promise((resolve, reject) => {
                    let callback = function(error, stdout, stderr) {
                        if (error && error.code !== 0) {
                            error.stdout = stdout.toString();
                            error.stderr = stderr.toString();
                            reject(error);
                            return;
                        }

                        var installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i)[1];
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

            let queryChained: (locations: { key: string, view: string }[]) => Promise<string> = (locations) => {
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
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': null },   // user keys have precendence over
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': null },   // machine keys
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '64' },   // default view (null) before 64bit view
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '32' },   // last is 32bit view, which will only be checked
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '32' }]). // for a 32bit git installation on 64bit Windows
                then(
                    (path) => resolve(path),
                    // fallback: PATH
                    (error) => resolve('git')
                );
        }
    })
}

export function getFileHistory(rootDir, relativeFilePath): Promise<any[]> {
    return getGitExecutable().then(
        (gitExecutable) => new Promise((resolve, reject) => {
            var options = { cwd: rootDir };
            var ls = spawn(gitExecutable,
                ['log', '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', relativeFilePath],
                options);

            var log = "";
            var error = "";
            ls.stdout.on('data', function(data) {
                log += data + "\n";
            });
            
            ls.stderr.on('data', function(data) {
                error += data;
            });
            
            ls.on('exit', function(code) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                
                var parsedLog = parser.parseLogContents(log);
                resolve(parsedLog);
            });

            ls.on('error', function(error) {
                reject(error);
            });
        }));
}

export function getLineHistory(rootDir: string, relativeFilePath: string, lineNumber: number): Thenable<any[]> {
    return getGitExecutable().then(
        (gitExecutable) => new Promise<any[]>((resolve, reject) => {
            var options = { cwd: rootDir }
            var lineArgs = "-L" + lineNumber + "," + lineNumber + ":" + relativeFilePath.replace(/\\/g, '/');
            var ls = spawn(gitExecutable,
                ['log', lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw'],
                options);

            var log = "";
            var error = "";
            ls.stdout.on('data', function(data) {
                log += data + "\n";
            });

            ls.stderr.on('data', function(data) {
                error += data;
            });

            ls.on('exit', function(code) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }

                var parsedLog = parser.parseLogContents(log);
                resolve(parsedLog);
            });

            ls.on('error', function(error) {
                reject(error);
            });
        }));
}

export function writeFile(rootDir: string, commitSha1: string, sourceFilePath: string, targetFile: string): Thenable<any> {
    return getGitExecutable().then(
        (gitExecutable) => new Promise<any>((resolve, reject) => {
            var options = { cwd: rootDir }
            var objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
            var ls = spawn(gitExecutable, ['show', objectId], options);

            var log = "";
            var error = "";
            ls.stdout.on('data', function(data) {
                fs.appendFile(targetFile, data);
            });

            ls.stderr.on('data', function(data) {
                error += data;
            });

            ls.on('exit', function(code) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }

                resolve(targetFile);
            });
        }));
}