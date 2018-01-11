// import { spawn } from 'child_process';
// import * as logger from '../logger';
// import { LogEntry } from '../types';
// import { getGitPath } from './gitPaths';
// import * as parser from './logParser';

// export async function getDiff(rootDir: string, leftHash: string, rightHash: string): Promise<LogEntry[]> {
//     const args = ['diff', '--numstat', '--summary', leftHash, rightHash];
//     const gitPath = await getGitPath();
//     return new Promise<LogEntry[]>((resolve, reject) => {
//         const options = { cwd: rootDir };

//         logger.logInfo(`git ${args.join(' ')}`);
//         const ls = spawn(gitPath, args, options);

//         let error = '';
//         const outputLines = [''];
//         const entries: LogEntry[] = [];

//         ls.stdout.setEncoding('utf8');
//         ls.stdout.on('data', (data: string) => {
//             data.split(/\r?\n/g).forEach((line, index, lines) => {
//                 outputLines[outputLines.length - 1] += line;
//                 outputLines.push('');
//             });
//         });

//         ls.stdout.on('end', () => {
//             // Process last entry as no trailing seperator
//             if (outputLines.length !== 0) {
//                 const entry = parser.parseLogEntry(outputLines, true);
//                 if (entry !== null) {
//                     entries.push(entry);
//                 }
//             }
//         });

//         ls.stderr.setEncoding('utf8');
//         ls.stderr.on('data', data => {
//             error += data;
//         });

//         ls.on('error', err => {
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
//             resolve(entries);
//         });
//     });
// }
