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

        // Download VS Code, unzip it and run the integration test.
        // Pin to a VS Code version compatible with the targeted engine (`^1.76.0`);
        // override with VSCODE_TEST_VERSION (e.g. 'stable') when needed.
        // NOTE: we must NOT pass `--disable-extensions` here - that disables the
        // built-in `vscode.git` extension whose API the extension depends on.
        // `--disable-workspace-trust` prevents the untrusted-workspace prompt from
        // blocking the git extension's API from initializing in headless runs.
        await runTests({
            version: process.env.VSCODE_TEST_VERSION || '1.76.1',
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [path.join(tempRepoFolder, 'test_gitHistory'), '--disable-workspace-trust'],
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
