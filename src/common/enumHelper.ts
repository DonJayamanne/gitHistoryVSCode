
// tslint:disable-next-line:no-stateless-class no-unnecessary-class
export class EnumHelpers {
    // tslint:disable-next-line:function-name
    public static *Values<T>(enumType: {}): IterableIterator<T> {
        // tslint:disable-next-line:no-for-in
        for (const item in enumType) {
            if (typeof enumType[item] === 'number') {
                // tslint:disable-next-line:prefer-type-cast no-any
                yield enumType[item] as any as T;
            }
        }
    }
}
