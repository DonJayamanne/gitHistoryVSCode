import * as path from 'path';
import * as fs from 'fs-extra';

export const extensionRootPath = path.resolve(__dirname, '..', '..');
export const tempFolder = path.join(extensionRootPath, 'temp');
export const tempRepoFolder = path.join(extensionRootPath, 'temp', 'testing');
export const noop = () => {
    //Noop.
};

export const sleep = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
fs.mkdirpSync(tempFolder);
fs.mkdirpSync(tempRepoFolder);
