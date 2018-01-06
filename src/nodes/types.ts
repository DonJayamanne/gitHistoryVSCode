export type Node = {
    /**
     * A human readable string which is rendered prominent.
     */
    label: string;
    /**
     * A human readable string which is rendered less prominent.
     */
    description: string;
    /**
     * A human readable string which is rendered less prominent.
     */
    detail?: string;
    // tslint:disable-next-line:prefer-method-signature
    preExecute?: () => boolean | Promise<boolean>;
    // tslint:disable-next-line:no-any
    execute(): void | Promise<any> | Thenable<any>;
};
