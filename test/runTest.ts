import * as path from 'path';
import * as fs from 'fs-extra';
import { runTests } from 'vscode-test';
import { extensionRootPath, tempRepoFolder } from './common';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = extensionRootPath;

        // The path to the extension test script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './extension/testRunner');
        fs.mkdirpSync(path.join(tempRepoFolder, 'test_gitHistory'));
        // Download VS Code, unzip it and run the integration test
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [path.join(tempRepoFolder, 'test_gitHistory'), '--disable-extensions'],
            extensionTestsEnv: { IS_TEST_MODE: '1' },
        });
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
