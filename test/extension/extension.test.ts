import * as assert from 'assert';
import * as vscode from 'vscode';

describe('Extension Test Suite', () => {
    test('Sample test', async () => {
        // We can use the real thing.
        assert.ok(typeof vscode.env.appName === 'string');
        // await vscode.window.showErrorMessage('Hello');
        assert.equal([1, 2, 3].indexOf(5), -1);
        assert.equal([1, 2, 3].indexOf(0), -1);
    });
});
