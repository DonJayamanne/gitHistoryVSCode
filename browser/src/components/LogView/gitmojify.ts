// tslint:disable-next-line:no-require-imports no-var-requires
const emojis = require('../../../../gemoji/db/emoji.json');

type Gitmoji = {
    // The long emoji code with colons.
    code: string;

    // The actual emoji.
    emoji: string;
};

const gitmojis: Gitmoji[] = [];
// tslint:disable-next-line:no-any
emojis.forEach((e: any) => e.aliases.forEach((alias: string) => gitmojis.push({
    code: `:${alias}:`,
    emoji: e.emoji
})));

export function gitmojify(message: string): string {
    gitmojis.forEach((gitmoji: Gitmoji) => message = message.replace(gitmoji.code, gitmoji.emoji));
    return message;
}
