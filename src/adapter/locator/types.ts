export interface IGitExecutableLocator {
    getGitPath(): Promise<string>;
}
