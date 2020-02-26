// tslint:disable-next-line:no-require-imports no-var-requires
const tmp = require('tmp');

export async function createTemporaryFile(extension: string, temporaryDirectory?: string): Promise<{ filePath: string; cleanupCallback: Function }> {
    const options: { postfix: string; dir?: string } = { postfix: extension };
    if (temporaryDirectory) {
        options.dir = temporaryDirectory;
    }

    return new Promise<{ filePath: string; cleanupCallback: Function }>((resolve, reject) => {
        // tslint:disable-next-line:no-any
        tmp.file(options, (err: Error, tmpFile: string, _fd: any, cleanupCallback: any) => {
            if (err) {
                return reject(err);
            }
            resolve({ filePath: tmpFile, cleanupCallback: cleanupCallback });
        });
    });
}

export function formatDate(date: Date) {
    const lang = process.env.language;
    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };

    return date.toLocaleString(lang, dateOptions);
}

export async function asyncFilter<T>(arr: T[], callback): Promise<T[]> {
    return (
        await Promise.all(arr.map(
            async item => (await callback(item)) ? item : undefined)
        )
    ).filter(i => i !== undefined) as T[];
}
