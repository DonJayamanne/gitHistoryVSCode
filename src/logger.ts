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
    getLogChannel().appendLine(`[Error-${getTimeAndms()}] ${error.toString()}`.replace(/(\r\n|\n|\r)/gm, ''));
    getLogChannel().show();
    vscode.window.showErrorMessage('There was an error, please view details in the \'Git History Log\' output window');
}

export function logInfo(message: string) {
    if (logLevel === 'Info' || logLevel === 'Debug') {
        getLogChannel().appendLine(`[Info -${getTimeAndms()}] ${message}`);
    }
}

export function logDebug(message: string) {
    if (logLevel === 'Debug') {
        getLogChannel().appendLine(`[Debug-${getTimeAndms()}] ${message}`);
    }
}

function getTimeAndms(): string {
    const date = new Date();
    return `${date.toLocaleTimeString().toString()}.${padms(date.getMilliseconds())}`;
}

function padms(ms: number): string {
    const pad = new Array(1 + 3).join('0');
    return (pad + ms).slice(-pad.length);
}

export function showInfo(message: string) {
    getInfoChannel().clear();
    getInfoChannel().appendLine(message);
    getInfoChannel().show();
}