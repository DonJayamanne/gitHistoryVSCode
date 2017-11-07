import { injectable } from 'inversify';
import { CancellationTokenSource, QuickPickItem, window, workspace, WorkspaceFolder } from 'vscode';
import { BranchSelection, CommittedFile, Status } from '../types';
import { IUiService } from './types';

const allBranches = 'All branches';
const currentBranch = 'Current branch';

@injectable()
export class UiService implements IUiService {
    private selectionActionToken?: CancellationTokenSource;
    public async getBranchSelection(): Promise<BranchSelection | undefined> {
        const itemPickList: QuickPickItem[] = [];
        itemPickList.push({ label: currentBranch, description: '' });
        itemPickList.push({ label: allBranches, description: '' });
        const modeChoice = await window.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });
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
    public async selectFileCommitCommandAction(commitedFile: CommittedFile): Promise<string | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();

        const items = [
            { label: 'View change log', command: 'git.commit.viewChangeLog', description: '' },
            { label: 'View file contents', command: 'git.commit.file.viewFileContents', description: '' },
            { label: 'Compare against workspace file', command: 'git.commit.file.compareAgainstWorkspace', description: '' }
        ];

        if (commitedFile.status !== Status.Added) {
            items.push({ label: 'Compare against previous version', command: 'git.commit.file.compareAgainstPrevious', description: '' });
        }

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        const selection = await window.showQuickPick(items, options);
        if (!selection || items.indexOf(selection) === -1) {
            return undefined;
        }

        return selection.command;
    }
    public async selectCommitCommandAction(_hash: string): Promise<string | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();

        const items = [
            { label: 'Cherry pick', command: 'git.commit.cherryPick', description: '' },
            { label: 'Compare with another commit', command: 'git.commit.selectForComparison', description: '' },
            { label: 'Compare with selected commit (xxxx)', command: 'git.commit.compareWithSelected', description: '' }
        ];

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        const selection = await window.showQuickPick(items, options);
        if (!selection || items.indexOf(selection) === -1) {
            return undefined;
        }

        return selection.command;
    }
}
