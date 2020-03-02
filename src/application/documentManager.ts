import { injectable } from 'inversify';
import { TextDocument, TextDocumentShowOptions, TextEditor, Uri, ViewColumn, window, workspace } from 'vscode';
import { IDocumentManager } from './types/documentManager';

@injectable()
export class DocumentManager implements IDocumentManager {
    public openTextDocument(uri: Uri): Thenable<TextDocument>;
    public openTextDocument(fileName: string): Thenable<TextDocument>;
    public openTextDocument(
        options?: { language?: string | undefined; content?: string | undefined } | undefined,
    ): Thenable<TextDocument>;
    public openTextDocument(options?: any);
    public openTextDocument(...args: any[]) {
        return workspace.openTextDocument.call(window, ...args);
    }
    public showTextDocument(
        document: TextDocument,
        column?: ViewColumn | undefined,
        preserveFocus?: boolean | undefined,
    ): Thenable<TextEditor>;
    public showTextDocument(
        document: TextDocument,
        options?: TextDocumentShowOptions | undefined,
    ): Thenable<TextEditor>;
    public showTextDocument(uri: Uri, options?: TextDocumentShowOptions | undefined): Thenable<TextEditor>;
    public showTextDocument(document: any, column?: any, preserveFocus?: any);
    public showTextDocument(...args: any[]) {
        // @ts-ignore
        return window.showTextDocument.call(window, ...args);
    }
}
