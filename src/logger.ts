import * as vscode from 'vscode';

let outInfoChannel: vscode.OutputChannel;
let outLogChannel: vscode.OutputChannel;
const logLevel = <string>vscode.workspace.getConfiguration('gitHistory').get('logLevel');

function getInfoChannel() {
    if (outInfoChannel === undefined) {
         outInfoChannel = vscode.window.createOutputChannel('Git History Info');
    }
    return outInfoChannel;
}

function getLogChannel() {
    if (outLogChannel === undefined) {
         outLogChannel = vscode.window.createOutputChannel('Git History Log');
    }
    return outLogChannel;
}

export function logError(error: any) {
    getLogChannel().appendLine(`[Error - ${new Date().toLocaleTimeString().toString()}] ${error.toString()}`);
    getLogChannel().show();
    vscode.window.showErrorMessage('There was an error, please view details in the \'Git History Log\' output window');
}

export function logInfo(message: string) {
    if (logLevel === 'Info' || logLevel === 'Debug') {
        getLogChannel().appendLine(`[Info  - ${new Date().toLocaleTimeString().toString()}] ${message}`);
    }
}

export function logDebug(message: string) {
    if (logLevel === 'Debug') {
        getLogChannel().appendLine(`[Debug - ${new Date().toLocaleTimeString().toString()}] ${message}`);
    }
}

export function showInfo(message: string) {
    getInfoChannel().clear();
    getInfoChannel().appendLine(message);
    getInfoChannel().show();
}