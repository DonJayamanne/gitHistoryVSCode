
function getAuthor(placeholders) {
    if (placeholders.author === 'DonJayamanne') {
        // skip owner
        return '';
    }
    return `- ${placeholders.author ? `@${placeholders.author}` : name}`;
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
