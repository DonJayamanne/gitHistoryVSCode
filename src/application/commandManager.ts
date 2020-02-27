import { injectable } from 'inversify';
import { commands, Disposable, TextEditor, TextEditorEdit } from 'vscode';
import { ICommandManager } from './types/commandManager';

@injectable()
export class CommandManager implements ICommandManager {
    public registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
        return commands.registerCommand(command, callback, thisArg);
    }
    public registerTextEditorCommand(
        command: string,
        callback: (textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void,
        thisArg?: any,
    ): Disposable {
        return commands.registerTextEditorCommand(command, callback, thisArg);
    }
    public executeCommand<T>(command: string, ...rest: any[]): Thenable<T | undefined> {
        return commands.executeCommand<T>(command, ...rest);
    }
    public getCommands(filterInternal?: boolean | undefined): Thenable<string[]> {
        return commands.getCommands(filterInternal);
    }
}
