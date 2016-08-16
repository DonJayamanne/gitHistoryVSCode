import * as parser from '../logParser';
import { exec, spawn } from 'child_process';
import * as os from 'os';
import {ActionedDetails, LogEntry, Sha1} from '../contracts';
import {getGitPath} from './historyUtils';

const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const STATS_SEPARATOR = parser.STATS_SEPARATOR;
const LOG_FORMAT = `--format="%n${LOG_ENTRY_SEPARATOR}%nrefs=%d%ncommit=%H%ncommitAbbrev=%h%ntree=%T%ntreeAbbrev=%t%nparents=%P%nparentsAbbrev=%p%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n%nnotes=%N%n${STATS_SEPARATOR}%n"`;
export function getHistory(rootDir: string, pageIndex: number = 0, pageSize: number = 100, branchName: string = 'master'): Promise<LogEntry[]> {
    let args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, branchName, '--numstat', '--'];
    args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--'];
    // This is how you can view the log across all branches
    // args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--']
    return getGitPath().then(gitExecutable => {
        return new Promise<LogEntry[]>((resolve, reject) => {
            let options = { cwd: rootDir };
            let ls = spawn(gitExecutable, args, options);
            let error = '';
            let outputLines = [''];
            const entries: LogEntry[] = [];

            ls.stdout.setEncoding('utf8');
            ls.stdout.on('data', (data: string) => {
                console.log(data);
                data.split(/\r?\n/g).forEach((line, index, lines) => {
                    if (line === LOG_ENTRY_SEPARATOR) {
                        let entry = parser.parseLogEntry(outputLines);
                        if (entry) {
                            entries.push(entry);
                        }
                        else {
                            let x = '';
                        }
                        outputLines = [''];
                    }
                    if (index === 0) {
                        if (data.startsWith(os.EOL)) {
                            outputLines.push(line);
                            return;
                        }

                        outputLines[outputLines.length - 1] += line;
                        if (lines.length > 1) {
                            outputLines.push('');
                        }
                        return;
                    }
                    if (index === lines.length - 1) {
                        outputLines[outputLines.length - 1] += line;
                        return;
                    }

                    outputLines[outputLines.length - 1] += line;
                    outputLines.push('');
                });
            });

            ls.stderr.setEncoding('utf8');
            ls.stderr.on('data', function (data) {
                error += data;
            });

            ls.on('exit', function (code) {
                if (error.length > 0) {
                    reject(error);
                    return;
                }

                resolve(entries);
            });
        });
    });
}