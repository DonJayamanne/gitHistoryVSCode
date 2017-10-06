// tslint:disable-next-line:no-require-imports no-var-requires
const tmp = require('tmp');

export interface IDeferred<T> {
    resolve(value?: T | PromiseLike<T>): void;
    // tslint:disable-next-line:no-any
    reject(reason?: any): void;
    readonly promise: Promise<T>;
    readonly resolved: boolean;
    readonly rejected: boolean;
    readonly completed: boolean;
}

class DeferredImpl<T> implements IDeferred<T> {
    private _resolve: (value?: T | PromiseLike<T>) => void;
    // tslint:disable-next-line:no-any
    private _reject: (reason?: any) => void;
    private _resolved: boolean = false;
    private _rejected: boolean = false;
    private _promise: Promise<T>;
    // tslint:disable-next-line:no-any
    constructor(private scope: any = null) {
        // tslint:disable-next-line:promise-must-complete
        this._promise = new Promise<T>((res, rej) => {
            this._resolve = res;
            this._reject = rej;
        });
    }
    public resolve(value?: T | PromiseLike<T>) {
        this._resolve.apply(this.scope ? this.scope : this, arguments);
        this._resolved = true;
    }
    // tslint:disable-next-line:no-any
    public reject(reason?: any) {
        this._reject.apply(this.scope ? this.scope : this, arguments);
        this._rejected = true;
    }
    get promise(): Promise<T> {
        return this._promise;
    }
    get resolved(): boolean {
        return this._resolved;
    }
    get rejected(): boolean {
        return this._rejected;
    }
    get completed(): boolean {
        return this._rejected || this._resolved;
    }
}
// tslint:disable-next-line:no-any
export function createDeferred<T>(scope: any = null): IDeferred<T> {
    return new DeferredImpl<T>(scope);
}

export function createTemporaryFile(extension: string, temporaryDirectory?: string): Promise<{ filePath: string, cleanupCallback: Function }> {
    const options: { postfix: string, dir?: string } = { postfix: extension };
    if (temporaryDirectory) {
        options.dir = temporaryDirectory;
    }

    return new Promise<{ filePath: string, cleanupCallback: Function }>((resolve, reject) => {
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
