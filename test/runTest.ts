import * as path from 'path';
import * as fs from 'fs-extra';
import { runTests } from 'vscode-test';
import { extensionRootPath, tempRepoFolder } from './common';
import { setupDefaultRepo } from './extension/repoSetup';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = extensionRootPath;

        // The path to the extension test script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './extension/testRunner');
        fs.mkdirpSync(path.join(tempRepoFolder, 'test_gitHistory'));

        // We'll check if this file exists, if it does, then tests failed.
        const testResultFailedFile = path.join(tempRepoFolder, 'tests.failed');
        if (fs.existsSync(testResultFailedFile)) {
            fs.unlinkSync(testResultFailedFile);
        }

        await setupDefaultRepo();

        // Download VS Code, unzip it and run the integration test
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [path.join(tempRepoFolder, 'test_gitHistory'), '--disable-extensions'],
            extensionTestsEnv: { IS_TEST_MODE: '1' },
        });

        if (fs.existsSync(testResultFailedFile)) {
            console.error('Failed to run tests');
            process.exit(1);
        }
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
