// import { exec, spawn } from 'child_process';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as vscode from 'vscode';
// import * as logger from '../logger';

// let gitPath: string;

// // tslint:disable-next-line:max-func-body-length
// export async function getGitPath(): Promise<string> {
//     if (gitPath !== undefined) {
//         return Promise.resolve(gitPath);
//     }
//     // tslint:disable-next-line:promise-must-complete
//     return new Promise<string>((resolve, reject) => {
//         // tslint:disable-next-line:no-backbone-get-set-outside-model
//         const gitPathConfig = <string>vscode.workspace.getConfiguration('git').get('path');
//         if (typeof gitPathConfig === 'string' && gitPathConfig.length > 0) {
//             if (fs.existsSync(gitPathConfig)) {
//                 logger.logInfo(`git path: ${gitPathConfig} - from vscode settings`);
//                 gitPath = gitPathConfig;
//                 resolve(gitPathConfig);
//                 return;
//             }
//             else {
//                 logger.logError(`git path: ${gitPathConfig} - from vscode settings in invalid`);
//             }
//         }

//         if (process.platform !== 'win32') {
//             logger.logInfo('git path: using PATH environment variable');
//             gitPath = 'git';
//             resolve('git');
//             return;
//         }
//         else {
//             // in Git for Windows, the recommendation is not to put git into the PATH.
//             // Instead, there is an entry in the Registry.
//             const regQueryInstallPath: (location: string, view: string | null) => Promise<string> = (location, view) => {
//                 // tslint:disable-next-line:no-shadowed-variable
//                 return new Promise((resolve, reject) => {
//                     // tslint:disable-next-line:no-any
//                     const callback = (error: any, stdout: any, stderr: any) => {
//                         if (error && error.code !== 0) {
//                             error.stdout = stdout.toString();
//                             error.stderr = stderr.toString();
//                             reject(error);
//                             return;
//                         }

//                         const installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i)[1];
//                         if (installPath) {
//                             resolve(`${installPath}\\bin\\git`);
//                         } else {
//                             reject();
//                         }
//                     };

//                     let viewArg = '';
//                     switch (view) {
//                         case '64': viewArg = '/reg:64'; break;
//                         case '32': viewArg = '/reg:64'; break;
//                         default: break;
//                     }

//                     exec(`reg query ${location} ${viewArg}`, callback);
//                 });
//             };

//             const queryChained: (locations: { key: string, view: string | null }[]) => Promise<string> = (locations) => {
//                 // tslint:disable-next-line:no-shadowed-variable
//                 return new Promise<string>((resolve, reject) => {
//                     if (locations.length === 0) {
//                         reject('None of the known git Registry keys were found');
//                         return;
//                     }

//                     const location = locations[0];
//                     regQueryInstallPath(location.key, location.view).then(
//                         // tslint:disable-next-line:no-unnecessary-callback-wrapper no-shadowed-variable
//                         (location) => resolve(location),
//                         (error) => queryChained(locations.slice(1)).then(
//                             // tslint:disable-next-line:no-unnecessary-callback-wrapper no-shadowed-variable
//                             (location) => resolve(location),
//                             // tslint:disable-next-line:no-unnecessary-callback-wrapper no-shadowed-variable
//                             (error) => reject(error)
//                         )
//                     );
//                 });
//             };

//             queryChained([
//                 // tslint:disable-next-line:object-literal-key-quotes
//                 { key: 'HKCU\\SOFTWARE\\GitForWindows', view: null },     // user keys have precendence over
//                 { key: 'HKLM\\SOFTWARE\\GitForWindows', view: null },     // machine keys
//                 { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '64' },   // default view (null) before 64bit view
//                 { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '64' },
//                 { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '32' },   // last is 32bit view, which will only be checked
//                 { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '32' }]). // for a 32bit git installation on 64bit Windows
//                 then(
//                 // tslint:disable-next-line:no-shadowed-variable
//                 (path: string) => {
//                     logger.logInfo(`git path: ${path} - from registry`);
//                     gitPath = path;
//                     resolve(path);
//                 },
//                 // tslint:disable-next-line:no-any
//                 (error: any) => {
//                     logger.logInfo('git path: falling back to PATH environment variable');
//                     gitPath = 'git';
//                     resolve('git');
//                 });
//         }
//     });
// }

// export async function getGitRepositoryPath(fileName: string): Promise<string> {
//     // tslint:disable-next-line:no-shadowed-variable
//     const gitPath = await getGitPath();
//     return new Promise<string>((resolve, reject) => {
//         const directory = fs.existsSync(fileName) && fs.statSync(fileName).isDirectory() ? fileName : path.dirname(fileName);
//         const options = { cwd: directory };
//         const args = ['rev-parse', '--show-toplevel'];

//         logger.logInfo(`git ${args.join(' ')}`);
//         const ls = spawn(gitPath, args, options);
//         let repoPath = '';
//         let error = '';
//         ls.stdout.on('data', (data) => {
//             // tslint:disable-next-line:prefer-template
//             repoPath += data + '\n';
//         });

//         ls.stderr.on('data', (data) => {
//             error += data;
//         });

//         ls.on('error', (err: Error) => {
//             logger.logError(err);
//             reject(err);
//         });

//         ls.on('close', () => {
//             if (error.length > 0) {
//                 logger.logError(error);
//                 reject(error);
//                 return;
//             }
//             let repositoryPath = repoPath.trim();
//             if (!path.isAbsolute(repositoryPath)) {
//                 repositoryPath = path.join(path.dirname(fileName), repositoryPath);
//             }
//             logger.logInfo(`git repo path: ${repositoryPath}`);
//             resolve(repositoryPath);
//         });
//     });
// }

// export async function getGitBranch(repoPath: string): Promise<string> {
//     // tslint:disable-next-line:no-shadowed-variable
//     const gitPath = await getGitPath();
//     return new Promise<string>((resolve, reject) => {
//         const options = { cwd: repoPath };
//         const args = ['rev-parse', '--abbrev-ref', 'HEAD'];
//         let branch = '';
//         let error = '';
//         const ls = spawn(gitPath, args, options);
//         ls.stdout.on('data', (data) => {
//             branch += data.slice(0, -1);
//         });

//         ls.stderr.on('data', (data) => {
//             error += data;
//         });

//         ls.on('error', (err: Error) => {
//             logger.logError(err);
//             reject(err);
//             return;
//         });

//         ls.on('close', () => {
//             resolve(branch);
//         });
//     });
// }
