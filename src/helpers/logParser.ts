import * as vscode from 'vscode';
import { ActionedDetails, FileStat, LogEntry, Modification } from '../types';
export const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA1';

const author_regex = /([^<]+)<([^>]+)>/;
const headers = {
    'Author': (current_commit: CommitInfo, author: string) => {
        const capture = author_regex.exec(author);
        if (capture) {
            current_commit.author_name = capture[1].trim();
            current_commit.author_email = capture[2].trim();
        } else {
            current_commit.author_name = author;
        }
    },
    'Commit': (current_commit: CommitInfo, author: string) => {
        const capture = author_regex.exec(author);
        if (capture) {
            current_commit.committer_name = capture[1].trim();
            current_commit.committer_email = capture[2].trim();
        }
        else {
            current_commit.committer_name = author;
        }
    },

    'AuthorDate': (current_commit: CommitInfo, date: Date) => {
        current_commit.author_date = date;
    },

    'CommitDate': (current_commit: CommitInfo, date: Date) => {
        current_commit.commit_date = date;
    },

    'Reflog': (current_commit: CommitInfo, data: any) => {
        current_commit.reflog_name = data.substring(0, data.indexOf(' '));
        const author = data.substring(data.indexOf(' ') + 2, data.length - 1);
        const capture = author_regex.exec(author);
        if (capture) {
            current_commit.reflog_author_name = capture[1].trim();
            current_commit.reflog_author_email = capture[2].trim();
        }
        else {
            current_commit.reflog_author_name = author;
        }
    }
};

export type CommitInfo = {
    refs: string[];
    file_line_diffs: any[];
    hash: string;
    parents: string[];
    message: string;
    author_email: string;
    author_date: any;
    author_name: string;
    commit_date: any;
    committer_name: string;
    committer_email: string;
    reflog_name: string;
    reflog_author_name: string;
    reflog_author_email: string;
};
const parse_git_log = function (data: any): CommitInfo[] {
    const commits: CommitInfo[] = [];
    let current_commit: CommitInfo;
    const temp_file_change: string[] = [];

    const parse_commit_line = function (row: string) {
        if (!row.trim()) return;
        current_commit = {
            refs: [], file_line_diffs: [], hash: '', parents: [], message: '',
            author_email: '', author_date: null, author_name: '', commit_date: null,
            committer_email: '', committer_name: '',
            reflog_author_email: '', reflog_author_name: '', reflog_name: ''
        };
        const ss = row.split('(');
        const hashes = ss[0].split(' ').slice(1).filter(function (hash: string) { return hash && hash.length; });
        current_commit.hash = hashes[0];
        current_commit.parents = hashes.slice(1);
        if (ss[1]) {
            const refs = ss[1].slice(0, ss[1].length - 1);
            current_commit.refs = refs.split(', ');
        }
        commits.push(current_commit);
        parser = parse_header_line;
    };

    const parse_header_line = function (row: string) {
        if (row.trim() === '') {
            parser = parse_commit_message;
        } else {
            for (const key in headers) {
                if (row.indexOf(key + ': ') === 0) {
                    headers[key](current_commit, row.slice((key + ': ').length).trim());
                    return;
                }
            }
        }
    };

    const parse_commit_message = function (row: string, index: number) {
        if (/:[\d]+\s[\d]+\s[\d|\w]+.../g.test(rows[index + 1])) {
            parser = parse_file_changes;
            return;
        }
        if (rows[index + 1] && rows[index + 1].indexOf('commit ') === 0) {
            parser = parse_commit_line;
            return;
        }
        if (current_commit.message) {
            current_commit.message += '\n';
        }
        else {
            current_commit.message = '';
        }
        current_commit.message += row.trim();
    };

    const parse_file_changes = (row: string, index: number) => {
        if (rows.length === index + 1 || rows[index + 1] && rows[index + 1].indexOf('commit ') === 0) {
            const total: any = [0, 0, 'Total'];
            for (let n = 0; n < current_commit.file_line_diffs.length; n++) {
                const file_line_diff = current_commit.file_line_diffs[n];
                if (!isNaN(parseInt(file_line_diff[0], 10))) {
                    total[0] += file_line_diff[0] = parseInt(file_line_diff[0], 10);
                }
                if (!isNaN(parseInt(file_line_diff[1], 10))) {
                    total[1] += file_line_diff[1] = parseInt(file_line_diff[1], 10);
                }
            }
            current_commit.file_line_diffs.splice(0, 0, total);
            parser = parse_commit_line;
            return;
        }
        if (row[0] === ':') {
            const val = row[row.lastIndexOf('... ') + 4];
            temp_file_change.push(val);
        }
        else {
            const nextChange = temp_file_change.shift();
            if (nextChange !== undefined) {
                current_commit.file_line_diffs.push(row.split('\t').concat(nextChange));
            }
        }
    };

    let parser: any = parse_commit_line;
    const rows = data.split('\n');

    rows.forEach((row: string, index: number) => {
        parser(row, index);
    });

    commits.forEach(commit => {
        commit.message = (typeof commit.message) === 'string' ? commit.message.trim() : '';
    });
    return commits;
};

export function parseLogContents(contents: string) {
    return parse_git_log(contents);
}

const prefixes = {
    refs: 'refs=',
    commit: 'commit=',
    commitAbbrev: 'commitAbbrev=',
    tree: 'tree=',
    treeAbbrev: 'treeAbbrev=',
    parents: 'parents=',
    parentsAbbrev: 'parentsAbbrev=',
    author: 'author=',
    committer: 'committer=',
    subject: 'subject=',
    body: 'body=',
    notes: 'notes='
};
const prefixLengths = {
    refs: prefixes.refs.length,
    commit: prefixes.commit.length,
    commitAbbrev: prefixes.commitAbbrev.length,
    tree: prefixes.tree.length,
    treeAbbrev: prefixes.treeAbbrev.length,
    parents: prefixes.parents.length,
    parentsAbbrev: prefixes.parentsAbbrev.length,
    author: prefixes.author.length,
    committer: prefixes.committer.length,
    subject: prefixes.subject.length,
    body: prefixes.body.length,
    notes: prefixes.notes.length
};

// tslint:disable-next-line:max-func-body-length
export function parseLogEntry(lines: string[], startWithNumstat: boolean = false): LogEntry | null {
    const logEntry: LogEntry = {} as LogEntry;
    let multiLineProperty: string = '';
    const filesAltered: string[] = [];
    let processingNumStat = startWithNumstat;
    let regMatch = null;
    const fileSummary: string[] = [];
    if (lines.filter(line => line.trim().length > 0).length === 0) {
        return null;
    }

    // tslint:disable-next-line:no-shadowed-variable cyclomatic-complexity
    lines.forEach((line, index, lines) => {
        if (line.indexOf(prefixes.refs) === 0) {
            regMatch = line.match(/HEAD -> refs\/heads\/([\w_\-\/.]+)/);

            if (regMatch !== null) {
                logEntry.headRef = regMatch[1];
            }

            const re = /refs\/remotes\/([\w+_\-\/.]+)/g;
            logEntry.remoteRefs = [];
            // tslint:disable-next-line:no-conditional-assignment
            while (regMatch = re.exec(line)) {
                logEntry.remoteRefs.push(regMatch[1]);
            }
            // Check if we have branch or tags
            return;
        }
        if (line.indexOf(prefixes.commit) === 0) {
            logEntry.hash = { full: line.substring(prefixLengths.commit).trim(), short: '' };
            return;
        }
        if (line.indexOf(prefixes.commitAbbrev) === 0) {
            logEntry.hash.short = line.substring(prefixLengths.commitAbbrev).trim();
            return;
        }
        if (line.indexOf(prefixes.tree) === 0) {
            logEntry.tree = { full: line.substring(prefixLengths.tree).trim(), short: '' };
            return;
        }
        if (line.indexOf(prefixes.treeAbbrev) === 0) {
            logEntry.tree.short = line.substring(prefixLengths.treeAbbrev).trim();
            return;
        }
        if (line.indexOf(prefixes.parents) === 0) {
            logEntry.parents = line.substring(prefixLengths.parents).trim().split(' ').map(hashLong => {
                return { full: hashLong, short: '' };
            });
            return;
        }
        if (line.indexOf(prefixes.parentsAbbrev) === 0) {
            line.substring(prefixLengths.parentsAbbrev).trim().split(' ').forEach((hashShort, idx) => {
                logEntry.parents[idx].short = hashShort;
            });
            return;
        }
        if (line.indexOf(prefixes.author) === 0) {
            logEntry.author = parseAuthCommitter(line.substring(prefixLengths.author));
            return;
        }
        if (line.indexOf(prefixes.committer) === 0) {
            logEntry.committer = parseAuthCommitter(line.substring(prefixLengths.committer));
            return;
        }
        if (line.indexOf(prefixes.subject) === 0) {
            logEntry.subject = line.substring(prefixLengths.subject).trim();
            return;
        }
        if (line.indexOf(prefixes.body) === 0) {
            logEntry.body = line.substring(prefixLengths.body);
            multiLineProperty = 'body';
            return;
        }
        if (line.indexOf(prefixes.notes) === 0) {
            logEntry.notes = line.substring(prefixLengths.notes);
            multiLineProperty = 'notes';
            return;
        }
        if (line.indexOf(STATS_SEPARATOR) === 0) {
            processingNumStat = true;
            return;
        }
        if (processingNumStat) {
            const trimmedLine = line.trim();
            if (trimmedLine.length > 0 && !Number.isInteger(parseInt(trimmedLine[0], 10))) {
                fileSummary.push(line.trim());
            }
            else {
                filesAltered.push(line.trim());
            }
            return;
        }
        if (logEntry && line && multiLineProperty) {
            logEntry[multiLineProperty] += line;
            return;
        }
    });

    if (Object.keys(logEntry).length === 0 && !startWithNumstat) {
        return null;
    }
    logEntry.fileStats = parseAlteredFiles(filesAltered, fileSummary);
    return logEntry;
}

function parseAlteredFiles(alteredFiles: string[], fileSummary: string[]): FileStat[] {
    const stats: FileStat[] = [];
    alteredFiles.filter(line => line.trim().length > 0).map(line => {
        const parts = line.split('\t').filter(part => part.trim().length > 0);
        if (parts.length !== 3) {
            return;
        }
        const add = parts[0] === '-' ? undefined : parseInt(parts[0], 10);
        const del = parts[1] === '-' ? undefined : parseInt(parts[1], 10);
        stats.push({ additions: add, deletions: del, path: parts[2], mode: Modification.Modified });
    });

    fileSummary
        .filter(line => line.trim().length > 0)
        .forEach(line => {
            const lineParts = line.trim().split(' ');
            if (lineParts.length === 0) {
                return;
            }
            // Remove first item
            const firstWord = lineParts.shift();
            if (firstWord !== 'create' && firstWord !== 'delete' && firstWord !== 'rename') {
                return;
            }

            if (firstWord === 'create' || firstWord === 'delete') {
                // Then the second word is 'mode'
                lineParts.shift();
                // Then the next is some number
                lineParts.shift();
            }
            else {
                // This is a rename, last word is some percentage
                lineParts.pop();
            }

            const file = lineParts.join(' ');

            // Look for this file list
            const fileSat = stats.find(fileStat => fileStat.path === file);
            if (fileSat) {
                // tslint:disable-next-line:switch-default
                switch (firstWord) {
                    case 'create': {
                        fileSat.mode = Modification.Created;
                        break;
                    }
                    case 'delete': {
                        fileSat.mode = Modification.Deleted;
                        break;
                    }
                    case 'rename': {
                        fileSat.mode = Modification.Renamed;
                        break;
                    }
                }
            }
        });
    return stats;
}

function parseAuthCommitter(details: string): ActionedDetails {
    const pos = details.lastIndexOf('>');
    const time = parseInt(details.substring(pos + 1), 10);
    const date = new Date(time * 1000);
    const localisedDate = formatDate(date);
    const startPos = details.lastIndexOf('<');

    return {
        date: date,
        localisedDate: localisedDate,
        name: details.substring(0, startPos - 1).trim(),
        email: details.substring(startPos + 1, pos)
    };
}

export function formatDate(date: Date) {
    const lang = vscode.env.language;
    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleString(lang, dateOptions);
}
