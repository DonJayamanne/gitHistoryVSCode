import { inject, injectable } from 'inversify';
import * as _ from 'lodash';
import { CancellationTokenSource, QuickPickItem, workspace, WorkspaceFolder } from 'vscode';
import { LogEntry } from '../../browser/src/definitions';
import { IApplicationShell } from '../application/types';
import { ICommitCommandBuilder, IFileCommitCommandBuilder } from '../commands/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, CommittedFile, Hash } from '../types';
import { ICommand, IUiService } from './types';
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
    public async selectFileCommitCommandAction(workspaceFolder: string, branch: string | undefined, hash: Hash, committedFile: CommittedFile): Promise<ICommand | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = this.serviceContainer.getAll<IFileCommitCommandBuilder>(IFileCommitCommandBuilder)
            .map(builder => builder.getFileCommitCommands(workspaceFolder, branch, hash, committedFile));

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(_.flatten(commands), options);
    }
    public async selectCommitCommandAction(workspaceFolder: string, logEntry: LogEntry): Promise<ICommand | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = this.serviceContainer.getAll<ICommitCommandBuilder>(ICommitCommandBuilder)
            .map(builder => builder.getCommitCommands(workspaceFolder, undefined, logEntry));

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(_.flatten(commands), options);
    }
}
