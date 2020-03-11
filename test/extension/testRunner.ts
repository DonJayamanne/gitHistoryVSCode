import * as jest from 'jest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AggregatedResult } from '@jest/test-result';
import { tempRepoFolder } from '../common';

const extensionRoot = path.join(__dirname, '..', '..', '..');
type Output = { results: AggregatedResult };
export function run(): Promise<void> {
    // jest doesn't seem to provide a way to inject global/dynamic imports.
    // Basically if we have a `require`, jest assumes that it is a module on disc.
    // However `vscode` isn't a module in disc, its provided by vscode host environment.
    // Hack - put vscode namespace into global variable `process`, and re-export as as mock in jest (see __mocks__/vscode.ts).
    // Using global variables don't work, as jest seems to fiddle with that as well.
    (process as any).__VSCODE = require('vscode');

    const jestConfigFile = path.join(extensionRoot, 'jest.extension.config.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jestConfig = require(jestConfigFile);
    return new Promise((resolve, reject) => {
        jest.runCLI(jestConfig, [extensionRoot])
            .catch(error => {
                delete (process as any).__VSCODE;
                console.error('Calling jest.runCLI failed', error);
                reject(error);
            })
            .then(output => {
                delete (process as any).__VSCODE;
                if (!output) {
                    return resolve();
                }
                const results = output as Output;
                if (results.results.numFailedTestSuites || results.results.numFailedTests) {
                    // Do not reject, VSC does not exit gracefully, hence test job hangs.
                    // We don't want that, specially on CI.
                    fs.appendFileSync(path.join(tempRepoFolder, 'tests.failed'), 'failed');
                }
                resolve();
            });
    });
}
