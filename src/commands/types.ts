import { Disposable } from 'vscode';

export const IGitHistoryViewer = Symbol('ILogViewer');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryViewer extends Disposable {

}
