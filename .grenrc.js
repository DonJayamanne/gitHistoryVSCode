
function getAuthor(placeholders) {
    if (placeholders.author === 'DonJayamanne') {
        // skip owner
        return '';
    }

    if (placeholders.author === null) {
        // skip when no author could be found
        return '';
    }

    return `- @${placeholders.author}`;
}
function parseCommitLine(placeholders) {
    return `- [${placeholders.sha.substr(0, 7)}] ${placeholders.message} ${getAuthor(placeholders)}`
}

module.exports = {
    dataSource: "commits",
    "template": {
        commit: parseCommitLine
    }
}
