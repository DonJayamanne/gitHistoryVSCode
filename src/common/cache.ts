import { Disposable } from 'vscode';

const MAX_CACHE_ITEMS = 20;
// tslint:disable-next-line:no-any
const Cache: Map<string, any> = new Map<string, any>();
const CacheItemUsageFrequency: Map<string, number> = new Map<string, number>();

// tslint:disable-next-line:no-stateless-class
export class CacheRegister implements Disposable {
    public static get<T>(key: string): T | undefined {
        return Cache.has(key) ? Cache.get(key) : undefined;
    }
    public static has(key: string): boolean {
        return Cache.has(key);
    }
    // tslint:disable-next-line:no-any
    public static set(key: string, data: any): void {
        const counter = CacheItemUsageFrequency.has(key) ? CacheItemUsageFrequency.get(key)! : 0;
        // tslint:disable-next-line:no-increment-decrement
        CacheItemUsageFrequency.set(key, counter + 1);
        Cache.set(key, data);
        setTimeout(() => CacheRegister.reclaimSpace(), 1000);
    }
    private static reclaimSpace(): void {
        if (Cache.size <= MAX_CACHE_ITEMS) {
            return;
        }
        const keyWithCounters: { key: string; counter: number }[] = [];
        for (const key of Cache.keys()) {
            const counter = CacheItemUsageFrequency.get(key)!;
            keyWithCounters.push({ key, counter });
        }
        keyWithCounters.sort((a, b) => a.counter - b.counter);
        while (Cache.size > MAX_CACHE_ITEMS) {
            const key = keyWithCounters.shift()!.key;
            Cache.delete(key);
        }
    }
    public dispose() {
        Cache.clear();
    }
}

// tslint:disable-next-line:no-any
type Fn = (...args: any[]) => any;

export function cache(cacheKey: string) {
    // tslint:disable-next-line:no-any function-name no-function-expression
    return function (_target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Fn>) {
        const oldFn = descriptor.value!;
        // tslint:disable-next-line:no-any
        descriptor.value = async function (...args: any[]) {
            const key = `${cacheKey}.${propertyKey}.${JSON.stringify(args)}`;
            if (CacheRegister.has(key)) {
                return CacheRegister.get(key)!;
            }

            // tslint:disable-next-line:no-invalid-this
            const result = oldFn!.apply(this, args);
            if (result && result.then && result.catch) {
                // tslint:disable-next-line:no-any
                result.then((value: any) => {
                    CacheRegister.set(key, value);
                });
            }

            return result;
        };
        return descriptor;
    };
}
