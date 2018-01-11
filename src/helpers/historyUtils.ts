// import { spawn } from 'child_process';
// import * as fs from 'fs';
// import * as logger from '../logger';
// import * as gitPaths from './gitPaths';
// import { CommitInfo } from './logParser';
// import * as parser from './logParser';

// export async function getFileHistory(rootDir: string, relativeFilePath: string) {
//     return await getLog(rootDir, ['--no-abbrev-commit', '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--parents', '--numstat', '--topo-order', '--raw', '--follow', '--', relativeFilePath]);
// }
// export async function getFileHistoryBefore(rootDir: string, relativeFilePath: string, isoStrictDateTime: string) {
//     return await getLog(rootDir, ['--no-abbrev-commit', '--max-count=10', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', '--follow', `--before='${isoStrictDateTime}'`, '--', relativeFilePath]);
// }

// export async function getLineHistory(rootDir: string, relativeFilePath: string, lineNumber: number) {
//     const lineArgs = `-L${lineNumber},${lineNumber}:${relativeFilePath.replace(/\\/g, '/')}`;
//     return await getLog(rootDir, [lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw']);
// }

// async function getLog(rootDir: string, args: string[]) {
//     const gitPath = await gitPaths.getGitPath();
//     return new Promise<CommitInfo[]>((resolve, reject) => {
//         const options = { cwd: rootDir };
//         args.unshift('log');

//         logger.logInfo(`git ${args.join(' ')}`);
//         const ls = spawn(gitPath, args, options);

//         let log = '';
//         let error = '';
//         ls.stdout.on('data', (data) => {
//             // tslint:disable-next-line:prefer-template
//             log += data + '\n';
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
//             if (error.length > 0) {
//                 logger.logError(error);
//                 reject(error);
//                 return;
//             }
//             const parsedLog = parser.parseLogContents(log);
//             resolve(parsedLog);
//         });
//     });
// }

// export async function writeFile(rootDir: string, commitHash: string, sourceFilePath: string, targetFile: string): Promise<string> {
//     const gitPath = await gitPaths.getGitPath();
//     return new Promise<string>((resolve, reject) => {
//         const options = { cwd: rootDir };
//         const objectId = `${commitHash}:${sourceFilePath.replace(/\\/g, '/')}`;
//         const args = ['show', objectId];

//         logger.logInfo(`git ${args.join(' ')}`);
//         const ls = spawn(gitPath, args, options);

//         let error = '';
//         ls.stdout.on('data', (data) => {
//             fs.appendFileSync(targetFile, data);
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
//             if (error.length > 0) {
//                 if (error.includes('does not exist')) {
//                     resolve('fileUnavailable');
//                     return;
//                 }
//                 else {
//                     logger.logError(error);
//                     reject(error);
//                 }
//                 return;
//             }
//             resolve(targetFile);
//         });
//     });
// }
