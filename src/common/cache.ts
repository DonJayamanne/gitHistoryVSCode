import { Disposable } from 'vscode';

// tslint:disable:no-any

const MAX_CACHE_ITEMS = 50;
// tslint:disable-next-line:no-any
type CacheStore = Map<string, { expiryTime?: number; data: any }>;
const CacheItemUsageFrequency: Map<string, number> = new Map<string, number>();
const CacheStores = new Map<string, CacheStore>();

// tslint:disable-next-line:no-stateless-class
export class CacheRegister implements Disposable {
    public static get<T>(storageKey: string, key: string): { data: T } | undefined {
        const storage = CacheStores.get(storageKey)!;
        if (storage && storage.has(key)) {
            const entry = storage.get(key)!;
            if (!entry.expiryTime || entry.expiryTime < new Date().getTime()) {
                return { data: entry.data };
            }
            storage.delete(key);
        }
        return;
    }
    // tslint:disable-next-line:no-any
    public static add<T>(storageKey: string, key: string, data: T, expiryMs?: number): void {
        if (!CacheStores.has(storageKey)) {
            CacheStores.set(storageKey, new Map<string, { expiryTime?: number; data: any }>());
        }
        const storage = CacheStores.get(storageKey)!;
        const counter = CacheItemUsageFrequency.has(key) ? CacheItemUsageFrequency.get(key)! : 0;
        // tslint:disable-next-line:no-increment-decrement
        CacheItemUsageFrequency.set(key, counter + 1);
        const expiryTime = typeof expiryMs === 'number' ? new Date().getTime() + expiryMs : undefined;
        storage.set(key, { data, expiryTime });
        setTimeout(() => CacheRegister.reclaimSpace(), 1000);
    }
    private static reclaimSpace(): void {
        CacheStores.forEach(storage => {
            if (storage.size <= MAX_CACHE_ITEMS) {
                return;
            }
            const keyWithCounters: { key: string; counter: number }[] = [];
            for (const key of storage.keys()) {
                const counter = CacheItemUsageFrequency.get(key)!;
                keyWithCounters.push({ key, counter });
            }
            keyWithCounters.sort((a, b) => a.counter - b.counter);
            while (storage.size > MAX_CACHE_ITEMS) {
                const key = keyWithCounters.shift()!.key;
                storage.delete(key);
            }
        });
    }
    public dispose() {
        CacheStores.clear();
    }
}

// tslint:disable-next-line:no-any
type Fn = (...args: any[]) => any;

export function cache(storageKey: string): any;
// tslint:disable-next-line:unified-signatures
export function cache(storageKey: string, expiryMs: number): any;
// tslint:disable-next-line:unified-signatures
export function cache(storageKey: string, cacheKeyPrefix: string): any;
// tslint:disable-next-line:unified-signatures
export function cache(storageKey: string, cacheKeyPrefix: string, expiryMs: number): any;
export function cache(storageKey: string, arg1?: any, arg2?: any) {
    // tslint:disable-next-line:no-any function-name no-function-expression
    return function (_target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Fn>) {
        const oldFn = descriptor.value!;
        // tslint:disable-next-line:no-any
        descriptor.value = async function (...args: any[]) {
            const expiryMs = typeof arg1 === 'number' ? arg1 : (typeof arg2 === 'number' ? arg2 : -1);
            const cacheKeyPrefix = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : '');

            // tslint:disable-next-line:no-invalid-this no-parameter-reassignment
            storageKey = typeof this.getHashCode === 'function' ? `${storageKey}${this.getHashCode()}` : storageKey;
            const key = `${storageKey}.${storageKey}.${cacheKeyPrefix}.${propertyKey}.${JSON.stringify(args)}`;
            const entry = CacheRegister.get(storageKey, key)!;
            if (entry) {
                return entry.data;
            }

            // tslint:disable-next-line:no-invalid-this
            const result = oldFn.apply(this, args);
            if (result && result.then && result.catch) {
                // tslint:disable-next-line:no-any
                result.then((value: any) => {
                    // We could add the promise itself into the cache store.
                    // But lets leave this simple for now.
                    CacheRegister.add(storageKey, key, value, expiryMs);
                });
            }

            return result;
        };
        return descriptor;
    };
}
