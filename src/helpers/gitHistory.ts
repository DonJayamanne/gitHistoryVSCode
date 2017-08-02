import * as parser from './logParser';
import { spawn } from 'child_process';
import * as os from 'os';
import { LogEntry } from '../contracts';
import { getGitPath } from './gitPaths';
import * as logger from '../logger';

const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const STATS_SEPARATOR = parser.STATS_SEPARATOR;
const LOG_FORMAT = `--format="%n${LOG_ENTRY_SEPARATOR}%nrefs=%d%ncommit=%H%ncommitAbbrev=%h%ntree=%T%ntreeAbbrev=%t%nparents=%P%nparentsAbbrev=%p%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n%nnotes=%N%n${STATS_SEPARATOR}%n"`;

export async function getLogEntries(rootDir: string, branchName: string, pageIndex: number = 0, pageSize: number = 100): Promise<LogEntry[]> {

    let args: string[];
    if (branchName && branchName.length > 0) {
        args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--'];
    }
    else {
        args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--numstat', '--'];
    }

    const gitPath = await getGitPath();
    return new Promise<LogEntry[]>((resolve, reject) => {
        const options = { cwd: rootDir };

        logger.logInfo('git ' + args.join(' '));
        let ls = spawn(gitPath, args, options);

        let error = '';
        let outputLines = [''];
        const entries: LogEntry[] = [];

        ls.stdout.setEncoding('utf8');
        ls.stdout.on('data', (data: string) => {
            data.split(/\r?\n/g).forEach((line, index, lines) => {
                if (line === LOG_ENTRY_SEPARATOR) {
                    let entry = parser.parseLogEntry(outputLines);
                    if (entry !== null) {
                        entries.push(entry);
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

        ls.stdout.on('end', () => {
            // Process last entry as no trailing seperator
            if (outputLines.length !== 0) {
                let entry = parser.parseLogEntry(outputLines);
                if (entry !== null) {
                    entries.push(entry);
                }
            }
        });

        ls.stderr.setEncoding('utf8');
        ls.stderr.on('data', function (data) {
            error += data;
        });

        ls.on('error', function (error) {
            logger.logError(error);
            reject(error);
            return;
        });

        ls.on('close', () => {
            if (error.length > 0) {
                logger.logError(error);
                reject(error);
                return;
            }
            resolve(entries);
        });
    });
}