import { inject, injectable } from 'inversify';
import { ICommandManager } from '../../application/types/commandManager';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitCompareCommitViewExplorerCommandHandler } from '../types';

@injectable()
export class GitCompareCommitViewExplorerCommandHandler implements IGitCompareCommitViewExplorerCommandHandler {
    constructor( @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory) { }

    @command('git.commit.compare.view.hide', IGitCompareCommitViewExplorerCommandHandler)
    public async hide() {
        await this.commandManager.executeCommand('setContext', 'git.commit.compare.view.show', false);
    }

    @command('git.commit.compare.view.show', IGitCompareCommitViewExplorerCommandHandler)
    public async show() {
        await this.commandManager.executeCommand('setContext', 'git.commit.compare.view.show', true);
    }

    @command('git.commit.compare.view.showFilesOnly', IGitCompareCommitViewExplorerCommandHandler)
    public async showFilesView() {
        this.commitViewerFactory.getCommitViewer().showFilesView();
    }

    @command('git.commit.compare.view.showFolderView', IGitCompareCommitViewExplorerCommandHandler)
    public async showFolderView() {
        this.commitViewerFactory.getCommitViewer().showFolderView();
    }
}
