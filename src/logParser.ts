var author_regex = /([^<]+)<([^>]+)>/;
var headers = {
    'Author': function(current_commit, author) {
        var capture = author_regex.exec(author);
        if(capture) {
            current_commit.author_name = capture[1].trim();
            current_commit.author_email = capture[2].trim();
        } else {
            current_commit.author_name = author;
        }
    },

    'Commit': function(current_commit, author) {
        var capture = author_regex.exec(author);
        if (capture) {
            current_commit.committer_name = capture[1].trim();
            current_commit.committer_email = capture[2].trim();
        }
        else {
            current_commit.committer_name = author;
        }
    },

    'AuthorDate': function(current_commit, date) {
        current_commit.author_date = date;
    },

    'CommitDate': function(current_commit, date) {
        current_commit.commit_date = date;
    },

    'Reflog': function(current_commit, data) {
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

var parse_git_log = function(data) {
    var commits = [];
    var current_commit;
    var temp_file_change = [];
    
    var parse_commit_line = function(row) {
        if (!row.trim()) return;
        current_commit = { refs: [], file_line_diffs: [] };
        var ss = row.split('(');
        var sha1s = ss[0].split(' ').slice(1).filter(function(sha1) { return sha1 && sha1.length; });
        current_commit.sha1 = sha1s[0];
        current_commit.parents = sha1s.slice(1);
        if (ss[1]) {
            var refs = ss[1].slice(0, ss[1].length - 1);
            current_commit.refs = refs.split(', ');
        }
        commits.push(current_commit);
        parser = parse_header_line;
    }
    var parse_header_line = function(row) {
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
    var parse_commit_message = function(row, index) {
        if(/:[\d]+\s[\d]+\s[\d|\w]+.../g.test(rows[index + 1])) {
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
    var parse_file_changes = function(row, index) {
        if (rows.length === index + 1 || rows[index + 1] && rows[index + 1].indexOf('commit ') === 0) {
            var total:any = [0, 0, 'Total'];
            for (var n = 0; n < current_commit.file_line_diffs.length; n++) {
                var file_line_diff = current_commit.file_line_diffs[n];
                if (!isNaN(parseInt(file_line_diff[0], 10))) {
                    total[0] += file_line_diff[0] = parseInt(file_line_diff[0], 10);
                }
                if (!isNaN(parseInt(file_line_diff[1], 10))) {
                    total[1] += file_line_diff[1] = parseInt(file_line_diff[1], 10);
                }
            }
            current_commit.file_line_diffs.splice(0,0, total);
            parser = parse_commit_line;
            return;
        }
        if(row[0] == ':') {
            var val = row[row.lastIndexOf('... ') + 4];
            temp_file_change.push(val);
        }
        else {
            current_commit.file_line_diffs.push(row.split('\t').concat(temp_file_change.shift()));
        }
    }
    
    var parser:any = parse_commit_line;
    var rows = data.split('\n');
    
    rows.forEach(function(row, index) {
        parser(row, index);
    });

    commits.forEach(function(commit) { commit.message = (typeof commit.message) === 'string' ? commit.message.trim() : ''; });
    return commits;
};

//module.exports = parse_git_log;

export function parseLogContents(contents){
    return parse_git_log(contents);
}