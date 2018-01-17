import { inject, injectable } from 'inversify';
import { CancellationTokenSource, QuickPickItem, workspace, WorkspaceFolder, window } from 'vscode';
import { IApplicationShell } from '../application/types';
import { ICommitCommandFactory, IFileCommitCommandFactory } from '../commandFactories/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection } from '../types';
import { CommitDetails, FileCommitDetails, ICommand, IUiService } from './types';
const allBranches = '$(git-branch) All branches';
const currentBranch = '$(git-branch) Current branch';

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
        const folder: WorkspaceFolder | undefined = await window.showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
        return folder ? folder.uri.fsPath : undefined;
    }
    public async selectFileCommitCommandAction(fileCommit: FileCommitDetails): Promise<ICommand<FileCommitDetails> | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = await this.serviceContainer.get<IFileCommitCommandFactory>(IFileCommitCommandFactory).createCommands(fileCommit);
        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(commands, options);
    }
    public async selectCommitCommandAction(commit: CommitDetails): Promise<ICommand<CommitDetails> | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();
        const commands = await this.serviceContainer.get<ICommitCommandFactory>(ICommitCommandFactory).createCommands(commit);
        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        return this.application.showQuickPick(commands, options);
    }
}
