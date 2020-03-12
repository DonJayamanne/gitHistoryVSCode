import * as emoji from 'node-emoji';

export function gitmojify(message: string): string {
    return emoji.emojify(message);
}
