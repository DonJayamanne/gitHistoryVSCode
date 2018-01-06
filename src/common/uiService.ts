import { inject, injectable } from 'inversify';
import * as _ from 'lodash';
import { CancellationTokenSource, QuickPickItem, workspace, WorkspaceFolder } from 'vscode';
import { LogEntry } from '../../browser/src/definitions';
import { IApplicationShell } from '../application/types';
import { ICommitCommandBuilder, IFileCommitCommandBuilder } from '../commandHandlers/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, CommittedFile, Hash } from '../types';
import { ICommand, IUiService, Context } from './types';
const allBranches = 'All branches';
const currentBranch = 'Current branch';

@injectable()
export class UiService implements IUiService {
    private selectionActionToken?: CancellationTokenSource;
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(IApplicationShell) private application: IApplicationShell) { }

    public async getBranchSelection(): Promise<BranchSelection | undefined> {
        const itemPickList: QuickPickItem[] = [];
        itemPickList.push({ label: currentBranch, description: '' });
        itemPickList.push({ label: allBranches, description: '' });
        const modeChoice = await this.application.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });
        if (!modeChoice) {
            return;
        }

        return modeChoice.label === allBranches ? BranchSelection.All : BranchSelection.Current;
    }
    public async getWorkspaceFolder(): Promise<string | undefined> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!Array.isArray(workspaceFolders) || workspaceFolders.length === 0) {
            throw new Error('Please open a workspace folder');
        }
        if (workspaceFolders.length === 1) {
            return workspaceFolders[0].uri.fsPath;
        }
        // tslint:disable-next-line:no-any prefer-type-cast
        const folder: WorkspaceFolder | undefined = await (window as any).showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
        return folder ? folder.uri.fsPath : undefined;
    }
    public async selectFileCommitCommandAction(context: Context): Promise<ICommand | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = this.serviceContainer.getAll<IFileCommitCommandBuilder>(IFileCommitCommandBuilder)
            .map(builder => builder.getFileCommitCommands(context));

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(_.flatten(commands), options);
    }
    public async selectCommitCommandAction(context: Context): Promise<ICommand | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = this.serviceContainer.getAll<ICommitCommandBuilder>(ICommitCommandBuilder)
            .map(builder => builder.getCommitCommands(context));

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(_.flatten(commands), options);
    }
}
