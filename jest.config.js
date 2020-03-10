// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
module.exports = {
    // We don't want any other mocks from other places impacting this.
    roots: [path.join(__dirname, 'test', 'non-extension')],
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['./test/setup.ts'],
    testMatch: [path.join(__dirname, 'test/non-extension/adapter/**/*.test.ts')],
    collectCoverage: true,
};
