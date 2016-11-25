import { ActionedDetails, LogEntry, FileStat } from './contracts';
export const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA1';

var author_regex = /([^<]+)<([^>]+)>/;
var headers = {
    'Author': function (current_commit: any, author: string) {
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.author_name = capture[1].trim();
            current_commit.author_email = capture[2].trim();
        } else {
            current_commit.author_name = author;
        }
    },
    'Commit': function (current_commit: any, author: string) {
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.committer_name = capture[1].trim();
            current_commit.committer_email = capture[2].trim();
        }
        else {
            current_commit.committer_name = author;
        }
    },

    'AuthorDate': function (current_commit: any, date: Date) {
        current_commit.author_date = date;
    },

    'CommitDate': function (current_commit: any, date: Date) {
        current_commit.commit_date = date;
    },

    'Reflog': function (current_commit: any, data: any) {
        current_commit.reflog_name = data.substring(0, data.indexOf(' '));
        var author = data.substring(data.indexOf(' ') + 2, data.length - 1);
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.reflog_author_name = capture[1].trim();
            current_commit.reflog_author_email = capture[2].trim();
        }
        else {
            current_commit.reflog_author_name = author;
        }
    },
};

var parse_git_log = function (data: any) {
    var commits: any[] = [];
    var current_commit: any;
    var temp_file_change: string[] = [];

    var parse_commit_line = function (row: string) {
        if (!row.trim()) return;
        current_commit = { refs: [], file_line_diffs: [] };
        var ss = row.split('(');
        var sha1s = ss[0].split(' ').slice(1).filter(function (sha1: string) { return sha1 && sha1.length; });
        current_commit.sha1 = sha1s[0];
        current_commit.parents = sha1s.slice(1);
        if (ss[1]) {
            var refs = ss[1].slice(0, ss[1].length - 1);
            current_commit.refs = refs.split(', ');
        }
        commits.push(current_commit);
        parser = parse_header_line;
    }
    var parse_header_line = function (row: string) {
        if (row.trim() == '') {
            parser = parse_commit_message;
        } else {
            for (var key in headers) {
                if (row.indexOf(key + ': ') == 0) {
                    headers[key](current_commit, row.slice((key + ': ').length).trim());
                    return;
                }
            }
        }
    }
    var parse_commit_message = function (row: string, index: number) {
        if (/:[\d]+\s[\d]+\s[\d|\w]+.../g.test(rows[index + 1])) {
            //if (/[\d-]+\t[\d-]+\t.+/g.test(rows[index + 1])) {
            parser = parse_file_changes;
            return;
        }
        if (rows[index + 1] && rows[index + 1].indexOf('commit ') == 0) {
            parser = parse_commit_line;
            return;
        }
        if (current_commit.message)
            current_commit.message += '\n';
        else current_commit.message = '';
        current_commit.message += row.trim();
    }
    var parse_file_changes = function (row: string, index: number) {
        if (rows.length === index + 1 || rows[index + 1] && rows[index + 1].indexOf('commit ') === 0) {
            var total: any = [0, 0, 'Total'];
            for (var n = 0; n < current_commit.file_line_diffs.length; n++) {
                var file_line_diff = current_commit.file_line_diffs[n];
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
        if (row[0] == ':') {
            var val = row[row.lastIndexOf('... ') + 4];
            temp_file_change.push(val);
        }
        else {
            current_commit.file_line_diffs.push(row.split('\t').concat(temp_file_change.shift()));
        }
    }

    var parser: any = parse_commit_line;
    var rows = data.split('\n');

    rows.forEach(function (row: string, index: number) {
        parser(row, index);
    });

    commits.forEach(function (commit) { commit.message = (typeof commit.message) === 'string' ? commit.message.trim() : ''; });
    return commits;
};

//module.exports = parse_git_log;

export function parseLogContents(contents: string) {
    return parse_git_log(contents);
}

/*
    refs= (HEAD -> refs/heads/master, refs/remotes/origin/master, refs/remotes/origin/HEAD)
    commit=666ed83a2d465257201cdac215a553ddee3cccbe
    commitAbbrev=666ed83
    tree=943fbb83770c3aabd4b4a9370130cb63f2af0965
    treeAbbrev=943fbb8
    parents=0baba80028fbc4852d327872b1dd020146200ca0
    parentsAbbrev=0baba80
    author=Andre Weinand <aweinand@microsoft.com> 1470819523
    committer=Andre Weinand <aweinand@microsoft.com> 1470819523
    subject=Revert "update node-debug for xhr caching"
    body=This reverts commit ae91d66546e3976c0e61bfa9f07675cfbd90f7c0.


    notes=


    commit=0baba80028fbc4852d327872b1dd020146200ca0
*/

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
}
export function parseLogEntry(lines: string[]): LogEntry {
    let logEntry: LogEntry = {} as LogEntry;
    let multiLineProperty: string = null;
    let filesAltered: string[] = [];
    let processingNumStat = false;
    if (lines.filter(line => line.trim().length > 0).length === 0) {
        return null;
    }

    lines.forEach((line, index, lines) => {
        if (line.indexOf(prefixes.refs) === 0) {
            logEntry.refs = line.substring(prefixLengths.refs).split(',').map((item, index, items) => {
                // remove the leading (
                if (index === 0) {
                    item = item.trim().substring(1);
                    // remove the trailing (                    
                    if (items.length === 1) {
                        item = item.substring(0, item.length - 2);
                    }

                    item = item.trim();
                }
                else {
                    // remove the trailing (
                    if (index === items.length - 1) {
                        item = item.trim();
                        item = item.substring(0, item.length - 1).trim();
                    }
                }

                return item;
            });

            // Check if we have branch or tags
            return;
        }
        if (line.indexOf(prefixes.commit) === 0) {
            logEntry.sha1 = { full: line.substring(prefixLengths.commit).trim(), short: '' };
            return;
        }
        if (line.indexOf(prefixes.commitAbbrev) === 0) {
            logEntry.sha1.short = line.substring(prefixLengths.commitAbbrev).trim();
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
            logEntry.parents = line.substring(prefixLengths.parents).trim().split(' ').map(shaLong => {
                return { full: shaLong, short: '' };
            });
            return;
        }
        if (line.indexOf(prefixes.parentsAbbrev) === 0) {
            line.substring(prefixLengths.parentsAbbrev).trim().split(' ').forEach((shaShort, index) => {
                logEntry.parents[index].short = shaShort;
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
            filesAltered.push(line.trim());
            return;
        }
        if (logEntry && line && multiLineProperty) {
            logEntry[multiLineProperty] += line;
            return;
        }
    });

    if (Object.keys(logEntry).length === 0) {
        return null;
    }
    logEntry.fileStats = parseAlteredFiles(filesAltered);
    return logEntry;
    // if (typeof commit.files === "string") {
    //     let changes = commit.files.split(/\r?\n/g) as string[];
    //     commit.changes = changes.filter(change => change.trim().length > 0).map(change => {
    //         // Using regexp in here just causes js to go nuts
    //         // No idea, something nice to raise on stack overflow
    //         change = change.trim();
    //         let pos = change.indexOf(' ');
    //         let added = change.substring(0, pos);
    //         change = change.substring(pos).trim();

    //         pos = change.indexOf(' ');
    //         let deleted = change.substring(0, pos);
    //         let file = change.substring(pos).trim();

    //         return {
    //             added: parseInt(added), deleted: parseInt(deleted), file: file
    //         };
    //     });
    // }
    // else {
    //     commit.changes = [];
    // }

    // if (commit.files) {
    //     delete commit.files;

    // }

    // return commit as LogEntry;
}

function parseAlteredFiles(alteredFiles: string[]): FileStat[] {
    let stats: FileStat[] = [];
    alteredFiles.filter(line => line.trim().length > 0).map(line => {
        const parts = line.split('\t').filter(part => part.trim().length > 0);
        if (parts.length !== 3) {
            return;
        }
        const add = parts[0] === '-' ? null : parseInt(parts[0]);
        const del = parts[1] === '-' ? null : parseInt(parts[1]);
        stats.push({ additions: add, deletions: del, path: parts[2] });
    });

    return stats;
}
function parseAuthCommitter(details: string): ActionedDetails {
    let pos = details.lastIndexOf(">");
    let time = parseInt(details.substring(pos + 1));
    let date = new Date(time * 1000);
    let startPos = details.lastIndexOf("<");

    return {
        date: date,
        name: details.substring(0, startPos - 1).trim(),
        email: details.substring(startPos + 1, pos)
    }
}
