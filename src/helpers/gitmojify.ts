const emojis = require('../../../resources/gemoji/db/emoji.json');

/**
 * A gitmoji.
 */
interface Gitmoji {
    /** The long emoji code with colons. */
    code: string,

    /** The actual emoji. */
    emoji: string
}

const gitmojis: Gitmoji[] = [];
emojis.forEach((e: any) => e.aliases.forEach((alias: string) => gitmojis.push({
    code: ':' + alias + ':',
    emoji: e.emoji
})));

export function gitmojify(message: string): string {
    gitmojis.forEach((gitmoji: Gitmoji) => message = message.replace(gitmoji.code, gitmoji.emoji));
    return message;
}