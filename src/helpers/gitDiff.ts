import * as parser from './logParser';
import { spawn } from 'child_process';
import { LogEntry } from '../contracts';
import { getGitPath } from './gitPaths';
import * as logger from '../logger';

export async function getDiff(rootDir: string, leftHash: string, rightHash: string): Promise<LogEntry[]> {
    const args = ['diff', '--numstat', '--summary', leftHash, rightHash];
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
                outputLines[outputLines.length - 1] += line;
                outputLines.push('');
            });
        });

        ls.stdout.on('end', () => {
            // Process last entry as no trailing seperator
            if (outputLines.length !== 0) {
                let entry = parser.parseLogEntry(outputLines, true);
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