export interface IGitCommandExecutor {
    exec(args: string[], cwd: string): Promise<string>;
    // tslint:disable-next-line:unified-signatures
    exec(args: string[], options: { cwd: string, shell?: boolean }): Promise<string>;
}
