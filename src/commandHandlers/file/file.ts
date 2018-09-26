import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { ICommandManager, IDocumentManager } from '../../application/types';
import { command } from '../registration';
import { IFileCommandHandler } from '../types';
import { isTextFile } from './mimeTypes';

@injectable()
export class FileCommandHandler implements IFileCommandHandler {
    constructor( @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IDocumentManager) private documentManager: IDocumentManager) { }

    @command('git.openFileInViewer', IFileCommandHandler)
    public async openFile(file: Uri): Promise<void> {
        if (isTextFile(file)) {
            const doc = await this.documentManager.openTextDocument(file);
            await this.documentManager.showTextDocument(doc, { preview: true });
        } else {
            await this.commandManager.executeCommand('vscode.open', file);
        }
    }
}
