import { Disposable } from 'vscode';

const MAX_CACHE_ITEMS = 50;
type CacheStore = Map<string, { expiryTime?: number; data: any }>;
const CacheItemUsageFrequency: Map<string, number> = new Map<string, number>();
const CacheStores = new Map<string, CacheStore>();

export class CacheRegister implements Disposable {
    public static get<T>(storageKey: string, key: string): { data: T } | undefined {
        const storage = CacheStores.get(storageKey)!;
        if (storage && storage.has(key)) {
            const entry = storage.get(key)!;
            if (!entry.expiryTime || entry.expiryTime > new Date().getTime()) {
                return { data: entry.data };
            }
            storage.delete(key);
        }

        return;
    }
    public static add<T>(storageKey: string, key: string, data: T, expiryMs?: number): void {
        if (!CacheStores.has(storageKey)) {
            CacheStores.set(storageKey, new Map<string, { expiryTime?: number; data: any }>());
        }
        const storage = CacheStores.get(storageKey)!;
        const counter = CacheItemUsageFrequency.has(key) ? CacheItemUsageFrequency.get(key)! : 0;
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

type Fn = (...args: any[]) => any;

export function cache(storageKey: string): any;
export function cache(storageKey: string, expiryMs: number): any;
export function cache(storageKey: string, cacheKeyPrefix: string): any;
export function cache(storageKey: string, cacheKeyPrefix: string, expiryMs: number): any;
export function cache(storageKey: string, arg1?: any, arg2?: any) {
    return function(_target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<Fn>) {
        const oldFn = descriptor.value!;
        descriptor.value = async function(...args: any[]) {
            const expiryMs = typeof arg1 === 'number' ? arg1 : typeof arg2 === 'number' ? arg2 : -1;
            const cacheKeyPrefix = typeof arg1 === 'string' ? arg1 : typeof arg2 === 'string' ? arg2 : '';

            const innerStorageKey =
                typeof this.getHashCode === 'function' ? `${storageKey}${this.getHashCode()}` : storageKey;
            const key = `${innerStorageKey}.${cacheKeyPrefix}.${propertyKey}.${JSON.stringify(args)}`;
            const entry = CacheRegister.get(innerStorageKey, key)!;
            if (entry) {
                return entry.data;
            }

            try {
                const result = await oldFn.apply(this, args);
                CacheRegister.add(innerStorageKey, key, result, expiryMs);

                return result;
            } catch (ex) {
                console.error(`Error calling ${storageKey}.${propertyKey} from @cache decorator`, ex);
            }
        };

        return descriptor;
    };
}
