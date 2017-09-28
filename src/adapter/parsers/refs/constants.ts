// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

// These are the prefixes returned by 'git log --decorate=full --format=%D'
// These also include prefixes returned by 'git branch --all'
// These also include prefixes returned by 'git show-ref'
export const HEAD_REF_PREFIXES = ['HEAD -> refs/heads/', 'refs/heads/'];
export const REMOTE_REF_PREFIXES = ['remotes/origin/HEAD -> ', 'refs/remotes/', 'remotes/'];
export const TAG_REF_PREFIXES = ['tag: refs/tags/', 'refs/tags/'];
