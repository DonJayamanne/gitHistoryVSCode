import * as vscode from 'vscode';

let outInfoChannel: vscode.OutputChannel;
let outLogChannel: vscode.OutputChannel;
const logLevel = vscode.workspace.getConfiguration('gitHistory').get('logLevel') as string;

function getInfoChannel() {
    if (outInfoChannel === undefined) {
        outInfoChannel = vscode.window.createOutputChannel('Git History Info');
    }
    return outInfoChannel;
}

export function getLogChannel() {
    if (outLogChannel === undefined) {
        outLogChannel = vscode.window.createOutputChannel('Git History');
    }
    return outLogChannel;
}

export function logError(error: any) {
    getLogChannel().appendLine(`[Error-${getTimeAndms()}] ${error.toString()}`.replace(/(\r\n|\n|\r)/gm, ''));
    getLogChannel().show();
    vscode.window.showErrorMessage("There was an error, please view details in the 'Git History Log' output window");
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
    const time = new Date();
    const hours = `0${time.getHours()}`.slice(-2);
    const minutes = `0${time.getMinutes()}`.slice(-2);
    const seconds = `0${time.getSeconds()}`.slice(-2);
    const milliSeconds = `00${time.getMilliseconds()}`.slice(-3);
    return `${hours}:${minutes}:${seconds}.${milliSeconds}`;
}

export function showInfo(message: string) {
    getInfoChannel().clear();
    getInfoChannel().appendLine(message);
    getInfoChannel().show();
}
