import { TextDocument, TextDocumentShowOptions, TextEditor, Uri, ViewColumn } from 'vscode';

export const IDocumentManager = Symbol('IDocumentManager');

export interface IDocumentManager {
    /**
     * Show the given document in a text editor. A [column](#ViewColumn) can be provided
     * to control where the editor is being shown. Might change the [active editor](#window.activeTextEditor).
     *
     * @param document A text document to be shown.
     * @param column A view column in which the [editor](#TextEditor) should be shown. The default is the [one](#ViewColumn.One), other values
     * are adjusted to be `Min(column, columnCount + 1)`, the [active](#ViewColumn.Active)-column is
     * not adjusted.
     * @param preserveFocus When `true` the editor will not take focus.
     * @return A promise that resolves to an [editor](#TextEditor).
     */
    showTextDocument(document: TextDocument, column?: ViewColumn, preserveFocus?: boolean): Thenable<TextEditor>;

    /**
     * Show the given document in a text editor. [Options](#TextDocumentShowOptions) can be provided
     * to control options of the editor is being shown. Might change the [active editor](#window.activeTextEditor).
     *
     * @param document A text document to be shown.
     * @param options [Editor options](#TextDocumentShowOptions) to configure the behavior of showing the [editor](#TextEditor).
     * @return A promise that resolves to an [editor](#TextEditor).
     */
    showTextDocument(document: TextDocument, options?: TextDocumentShowOptions): Thenable<TextEditor>;

    /**
     * A short-hand for `openTextDocument(uri).then(document => showTextDocument(document, options))`.
     *
     * @see [openTextDocument](#openTextDocument)
     *
     * @param uri A resource identifier.
     * @param options [Editor options](#TextDocumentShowOptions) to configure the behavior of showing the [editor](#TextEditor).
     * @return A promise that resolves to an [editor](#TextEditor).
     */
    showTextDocument(uri: Uri, options?: TextDocumentShowOptions): Thenable<TextEditor>;

    /**
     * Opens a document. Will return early if this document is already open. Otherwise
     * the document is loaded and the [didOpen](#workspace.onDidOpenTextDocument)-event fires.
     *
     * The document is denoted by an [uri](#Uri). Depending on the [scheme](#Uri.scheme) the
     * following rules apply:
     * * `file`-scheme: Open a file on disk, will be rejected if the file does not exist or cannot be loaded.
     * * `untitled`-scheme: A new file that should be saved on disk, e.g. `untitled:c:\frodo\new.js`. The language
     * will be derived from the file name.
     * * For all other schemes the registered text document content [providers](#TextDocumentContentProvider) are consulted.
     *
     * *Note* that the lifecycle of the returned document is owned by the editor and not by the extension. That means an
     * [`onDidClose`](#workspace.onDidCloseTextDocument)-event can occur at any time after opening it.
     *
     * @param uri Identifies the resource to open.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    openTextDocument(uri: Uri): Thenable<TextDocument>;

    /**
     * A short-hand for `openTextDocument(Uri.file(fileName))`.
     *
     * @see [openTextDocument](#openTextDocument)
     * @param fileName A name of a file on disk.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    openTextDocument(fileName: string): Thenable<TextDocument>;

    /**
     * Opens an untitled text document. The editor will prompt the user for a file
     * path when the document is to be saved. The `options` parameter allows to
     * specify the *language* and/or the *content* of the document.
     *
     * @param options Options to control how the document will be created.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    openTextDocument(options?: { language?: string; content?: string }): Thenable<TextDocument>;
}
