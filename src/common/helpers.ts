const tmp = require('tmp');

export interface Deferred<T> {
    resolve(value?: T | PromiseLike<T>): void;
    reject(reason?: any): void;
    readonly promise: Promise<T>;
    readonly resolved: boolean;
    readonly rejected: boolean;
    readonly completed: boolean;
}

class DeferredImpl<T> implements Deferred<T> {
    private _resolve: (value?: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;
    private _resolved: boolean = false;
    private _rejected: boolean = false;
    private _promise: Promise<T>;
    constructor(private scope: any = null) {
        this._promise = new Promise<T>((res, rej) => {
            this._resolve = res;
            this._reject = rej;
        });
    }
    resolve(value?: T | PromiseLike<T>) {
        this._resolve.apply(this.scope ? this.scope : this, arguments);
        this._resolved = true;
    }
    reject(reason?: any) {
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
export function createDeferred<T>(scope: any = null): Deferred<T> {
    return new DeferredImpl<T>(scope);
}

export function createTemporaryFile(extension: string, temporaryDirectory?: string): Promise<{ filePath: string, cleanupCallback: Function }> {
    let options: any = { postfix: extension };
    if (temporaryDirectory) {
        options.dir = temporaryDirectory;
    }

    return new Promise<{ filePath: string, cleanupCallback: Function }>((resolve, reject) => {
        tmp.file(options, function _tempFileCreated(err: any, tmpFile: string, fd: any, cleanupCallback: any) {
            if (err) {
                return reject(err);
            }
            resolve({ filePath: tmpFile, cleanupCallback: cleanupCallback });
        });
    });
}