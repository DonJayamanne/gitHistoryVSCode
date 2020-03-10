// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
    testEnvironment: 'node',
    // Be specific, as we don't want mocks from other test suites messing this up.
    roots: [path.join(__dirname, 'dist/test/extension')],
    moduleFileExtensions: ['js'],
    testMatch: [path.join(__dirname, 'dist/test/extension/**/*.test.js')],
    setupFiles: [path.join(__dirname, 'dist/test/setup.js')],
    collectCoverage: true,
    verbose: true,
    debug: true,
    // Must for debugging and VSC integration.
    runInBand: true,
    cache: false,
    // Custom reporter so we can override where messages are written.
    // We want output written into console, not process.stdout streams.
    // See ./build/postInstall.js
    reporters: ['jest-standard-reporter'],
    useStderr: true,
    // Ensure it dies properly on CI (test step didn't exit).
    forceExit: true,
    // Ensure it dies properly on CI (test step didn't exit).
    detectOpenHandles: true,
};
