import * as path from 'path';
import * as fs from 'fs-extra';

export const extensionRootPath = path.resolve(__dirname, '..', '..');
export const tempFolder = path.join(extensionRootPath, 'temp');
export const tempRepoFolder = path.join(extensionRootPath, 'temp', 'testing');
export const noop = () => {
    //Noop.
};
export const sleep = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

/**
 * Wait for a condition to be fulfilled within a timeout.
 */
export async function waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number,
    errorMessage: string,
): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            // tslint:disable-next-line: no-use-before-declare
            clearTimeout(timer);
            reject(new Error(errorMessage));
        }, timeoutMs);
        const timer = setInterval(async () => {
            if (!(await condition().catch(() => false))) {
                return;
            }
            clearTimeout(timeout);
            clearTimeout(timer);
            resolve();
        }, 10);
    });
}

fs.mkdirpSync(tempFolder);
fs.mkdirpSync(tempRepoFolder);
