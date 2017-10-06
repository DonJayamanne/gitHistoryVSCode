// import { spawn } from 'child_process';
// import * as os from 'os';
// import * as logger from '../logger';
// import { LogEntry } from '../types';
// import { getGitPath } from './gitPaths';
// import * as parser from './logParser';

// const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
// const STATS_SEPARATOR = parser.STATS_SEPARATOR;
// const LOG_FORMAT = `--format="%n${LOG_ENTRY_SEPARATOR}%nrefs=%d%ncommit=%H%ncommitAbbrev=%h%ntree=%T%ntreeAbbrev=%t%nparents=%P%nparentsAbbrev=%p%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n%nnotes=%N%n${STATS_SEPARATOR}%n"`;

// export async function getLogEntries(rootDir: string, branchName: string, searchText: string, pageIndex: number = 0, pageSize: number = 100, commitHash?: string): Promise<LogEntry[]> {
//     // Time to clean up this mess
//     let args: string[];
//     if (commitHash && commitHash.length > 0) {
//         args = ['show', LOG_FORMAT, '--decorate=full', '--numstat', '--summary', commitHash];
//     }
//     else {
//         if (branchName && branchName.length > 0) {
//             args = ['log', LOG_FORMAT, `--grep=${searchText}`, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--summary', '--'];
//         }
//         else {
//             args = ['log', LOG_FORMAT, `--grep=${searchText}`, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--numstat', '--summary', '--'];
//         }
//     }

//     const gitPath = await getGitPath();
//     return new Promise<LogEntry[]>((resolve, reject) => {
//         const options = { cwd: rootDir };

//         logger.logInfo(`git ${args.join(' ')}`);
//         const ls = spawn(gitPath, args, options);

//         let error = '';
//         let outputLines = [''];
//         const entries: LogEntry[] = [];

//         ls.stdout.setEncoding('utf8');
//         ls.stdout.on('data', (data: string) => {
//             data.split(/\r?\n/g).forEach((line, index, lines) => {
//                 if (line === LOG_ENTRY_SEPARATOR) {
//                     const entry = parser.parseLogEntry(outputLines);
//                     if (entry !== null) {
//                         entries.push(entry);
//                     }
//                     outputLines = [''];
//                 }
//                 if (index === 0) {
//                     if (data.startsWith(os.EOL)) {
//                         outputLines.push(line);
//                         return;
//                     }

//                     outputLines[outputLines.length - 1] += line;
//                     if (lines.length > 1) {
//                         outputLines.push('');
//                     }
//                     return;
//                 }
//                 if (index === lines.length - 1) {
//                     outputLines[outputLines.length - 1] += line;
//                     return;
//                 }

//                 outputLines[outputLines.length - 1] += line;
//                 outputLines.push('');
//             });
//         });

//         ls.stdout.on('end', () => {
//             // Process last entry as no trailing seperator
//             if (outputLines.length !== 0) {
//                 const entry = parser.parseLogEntry(outputLines);
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
