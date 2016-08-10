import * as fs from 'fs';

var author_regex = /([^<]+)<([^>]+)>/;
var headers = {
    'Author': function (current_commit, author) {
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.author_name = capture[1].trim();
            current_commit.author_email = capture[2].trim();
        } else {
            current_commit.author_name = author;
        }
    },
    'Commit': function (current_commit, author) {
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.committer_name = capture[1].trim();
            current_commit.committer_email = capture[2].trim();
        }
        else {
            current_commit.committer_name = author;
        }
    },

    'AuthorDate': function (current_commit, date) {
        current_commit.author_date = date;
    },

    'CommitDate': function (current_commit, date) {
        current_commit.commit_date = date;
    },

    'Reflog': function (current_commit, data) {
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

var parse_git_log = function (data) {
    var commits = [];
    var current_commit;
    var temp_file_change = [];

    var parse_commit_line = function (row) {
        if (!row.trim()) return;
        current_commit = { refs: [], file_line_diffs: [] };
        var ss = row.split('(');
        var sha1s = ss[0].split(' ').slice(1).filter(function (sha1) { return sha1 && sha1.length; });
        current_commit.sha1 = sha1s[0];
        current_commit.parents = sha1s.slice(1);
        if (ss[1]) {
            var refs = ss[1].slice(0, ss[1].length - 1);
            current_commit.refs = refs.split(', ');
        }
        commits.push(current_commit);
        parser = parse_header_line;
    }
    var parse_header_line = function (row) {
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
    var parse_commit_message = function (row, index) {
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
    var parse_file_changes = function (row, index) {
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

    rows.forEach(function (row, index) {
        parser(row, index);
    });

    commits.forEach(function (commit) { commit.message = (typeof commit.message) === 'string' ? commit.message.trim() : ''; });
    return commits;
};

//module.exports = parse_git_log;

export function parseLogContents(contents) {
    return parse_git_log(contents);
}


const REGEXP = /commit=([a-f0-9]+)\ncommitAbbrev=([a-f0-9]+)\ntree=([a-f0-9]+)\ntreeAbbrev=([a-f0-9]+)\nparents=([a-f0-9 ]+)\nparentsAbbrev=([a-f0-9 ]+)\nauthor=(.+)<(.+)>\s+(\d+)\ncommitter=(.+)<(.+)>\s+(\d+)\nsubject=(.*)\nbody=[\s\S]*?34806ad9-833a-4524-8cd6-18ca4aa74f15\nnotes=[\s\S]*?34806ad9-833a-4524-8cd6-18ca4aa74f16\n{0,2}((^(\d+|-)\s+(\d+|-)\s+(.*)$\n)*)/gm;
const NAMED_REGEXP = /commit=(:<sha1>[a-f0-9]+)\ncommitAbbrev=(:<sha1Abbrev>[a-f0-9]+)\ntree=(:<tree>[a-f0-9]+)\ntreeAbbrev=(:<treeAbbrev>[a-f0-9]+)\nparents=(:<parents>[a-f0-9 ]+)\nparentsAbbrev=(:<parentsAbbrev>[a-f0-9 ]+)\nauthor=(:<author>(.+)<(.+)>\s+(\d+))\ncommitter=(:<committer>(.+)<(.+)>\s+(\d+))\nsubject=(:<subject>.*)\nbody=(:<body>[\s\S]*?34806ad9-833a-4524-8cd6-18ca4aa74f15)\nnotes=(:<notes>[\s\S]*?34806ad9-833a-4524-8cd6-18ca4aa74f16)\n{0,2}(:<files>(^(\d+|-)\s+(\d+|-)\s+(.*)$\n)*)/gm;

export function parseLogEntries(contents: string): LogEntry[] {
    //git log --format="34806ad9-833a-4524-8cd6-18ca4aa74f14%ncommit=%H%ntree=%T%nparents=%P%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n34806ad9-833a-4524-8cd6-18ca4aa74f15%nnotes=%N%n34806ad9-833a-4524-8cd6-18ca4aa74f16" --numstat
    let matches = contents.match(REGEXP);
    if (!Array.isArray(matches)) {
        return [];
    }

    const namedRegExp = require('named-js-regexp');
    return matches.map(match => {
        let compiledRegexp = namedRegExp(NAMED_REGEXP);
        let rawMatch = compiledRegexp.exec(match);
        const commit = rawMatch.groups();

        commit.body = commit.body.replace("\n34806ad9-833a-4524-8cd6-18ca4aa74f15", "");
        commit.notes = commit.notes.replace("\n34806ad9-833a-4524-8cd6-18ca4aa74f16", "");
        commit.author = parseAuthCommitter(commit.author);
        commit.committer = parseAuthCommitter(commit.committer);
        commit.sha1 = <Sha1>{ full: commit.sha1, short: commit.sha1Abbrev };
        commit.tree = <Sha1>{ full: commit.tree, short: commit.treeAbbrev };
        delete commit.commit;
        delete commit.commitAbbret;
        delete commit.treeAbbrev;
        if (commit.parents.indexOf(' ') > 0) {
            let parents = commit.parents.split(' ').filter(parent => parent.trim().length > 0) as string[];
            let parentAbbrevs = commit.parentsAbbrev.split(' ').filter(parent => parent.trim().length > 0) as string[];
            commit.parents = parents.map((value, index) => { return <Sha1>{ full: value, short: parentAbbrevs[index] }; });
        }

        if (typeof commit.files === "string") {
            let changes = commit.files.split(/\r?\n/g) as string[];
            commit.changes = changes.filter(change => change.trim().length > 0).map(change => {
                // Using regexp in here just causes js to go nuts
                // No idea, something nice to raise on stack overflow
                change = change.trim();
                let pos = change.indexOf(' ');
                let added = change.substring(0, pos);
                change = change.substring(pos).trim();

                pos = change.indexOf(' ');
                let deleted = change.substring(0, pos);
                let file = change.substring(pos).trim();

                return {
                    added: parseInt(added), deleted: parseInt(deleted), file: file
                };
            });
        }
        else {
            commit.changes = [];
        }

        if (commit.files) {
            delete commit.files;

        }

        return commit as LogEntry;
    });
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
export interface ActionedDetails {
    name: string;
    email: string;
    date: Date;
}
export interface LogEntry {
    author: ActionedDetails;
    committer: ActionedDetails;
    parents: Sha1[];
    sha1: Sha1;
    tree: Sha1;
    subject: string;
    body: string;
    notes: string;
    changes: [number, number, string][];
}

export interface Sha1 {
    full: string;
    short: string;
}