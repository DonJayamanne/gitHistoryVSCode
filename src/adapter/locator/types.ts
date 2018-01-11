export const IGitExecutableLocator = Symbol('IGitExecutableLocator');
export interface IGitExecutableLocator {
    getGitPath(): Promise<string>;
}
