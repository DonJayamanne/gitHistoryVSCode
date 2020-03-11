/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs-extra');

const extensionRoot = path.join(__dirname, '..');

/**
 * When running jest tests from within VS Code, the test results are not written the the console.log.
 * Instead jest writes them to process.stdout and process.stderr streams.
 * These are not displayed in the VSC debugger output panel.
 * To resolve this, we need to change where jest reporters write the results.
 * Or better yet, find out how/why VSC doesn't allow writing to process.stdout and fix that if possble.
 *
 * I have opted to go down the hacky and simple patch, modify jest reporter to write to console log.
 */
function fixReportWriter() {
    const fileToFix = path.join(extensionRoot, 'node_modules', 'jest-standard-reporter', 'src', 'stdlib.js');
    if (!fs.existsSync(fileToFix)) {
        throw new Error(`File not found, ${fileToFix}`);
    }

    const oldContents = fs.readFileSync(fileToFix).toString();
    const newContents = oldContents.replace(/this.err\(/g, 'console.error(').replace(/this.out\(/g, 'console.log(');

    if (newContents === oldContents && oldContents.includes('console.error(') && oldContents.includes('console.log(')) {
        return;
    }
    if (newContents === oldContents) {
        throw new Error(
            `Contents of the file have changed, please update this code to fix the jest reporter, ${fileToFix}`,
        );
    }

    fs.writeFileSync(fileToFix, newContents);
    console.info(`File ${path.relative(__dirname, fileToFix)} updated in ./build/postInstall.js.`);
}

fixReportWriter();
