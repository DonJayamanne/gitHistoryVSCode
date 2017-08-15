import { LogEntry } from './git';
import { GitExec } from './gitExec';
import logEntryParser from './parsers/logParser';

const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const ITEM_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA6';
const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA7';
const LOG_FORMAT_ARGS = ['%d', '%H', '%h', '%T', '%t', '%P', '%p', '%an', '%ae', '%at', '%c', '%ce', '%ct', '%s', '%b', '%N'];
const LOG_FORMAT = `--format="${LOG_ENTRY_SEPARATOR}${[...LOG_FORMAT_ARGS, STATS_SEPARATOR].join(ITEM_ENTRY_SEPARATOR)}"`;

export class Repository {
    constructor(private gitExec: GitExec) {

    }

    public async getLogEntries(pageIndex: number = 0, pageSize: number = 100, branchName?: string): Promise<LogEntry[]> {
        let args = [];
        if (branchName && branchName.length > 0) {
            args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--summary', '--'];
        }
        else {
            args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--numstat', '--summary', '--'];
        }

        const gitRootPath = await this.gitExec.getGitRoot();
        const output = await this.gitExec.exec(args);

        // Run another git history, but get file stats instead of the changes
        const outputWithFileModeChanges = await this.gitExec.exec(args.map(arg => arg === '--summary' ? '--name-status' : arg));
        const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);

        return output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => logEntryParser(entry, entriesWithFileModeChanges[index], gitRootPath, ITEM_ENTRY_SEPARATOR, LOG_FORMAT_ARGS));
    }

    public async getCommit(sha: string): Promise<LogEntry | undefined> {
        let args = ['show', LOG_FORMAT, '--decorate=full', '--numstat', '--summary', '--', sha];

        const gitRootPath = await this.gitExec.getGitRoot();
        const output = await this.gitExec.exec(args);

        // Run another git history, but get file stats instead of the changes
        const outputWithFileModeChanges = await this.gitExec.exec(args.map(arg => arg === '--summary' ? '--name-status' : arg));
        const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);

        const entries = output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => logEntryParser(entry, entriesWithFileModeChanges[index], gitRootPath, ITEM_ENTRY_SEPARATOR, LOG_FORMAT_ARGS));

        return entries.length > 0 ? entries[0] : undefined;
    }
}