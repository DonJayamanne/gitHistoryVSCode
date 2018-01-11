export interface IDeferred<T> {
    readonly promise: Promise<T>;
    readonly resolved: boolean;
    readonly rejected: boolean;
    readonly completed: boolean;
    resolve(value?: T | PromiseLike<T>): void;
    // tslint:disable-next-line:no-any
    reject(reason?: any): void;
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
    public resolve(_value?: T | PromiseLike<T>) {
        this._resolve.apply(this.scope ? this.scope : this, arguments);
        this._resolved = true;
    }
    // tslint:disable-next-line:no-any
    public reject(_reason?: any) {
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
