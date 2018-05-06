import { inject, injectable } from 'inversify';
import * as path from 'path';
import { CancellationTokenSource, QuickPickItem, Uri } from 'vscode';
import { IApplicationShell } from '../application/types';
import { IWorkspaceService } from '../application/types/workspace';
import { ICommitCommandFactory, IFileCommitCommandFactory } from '../commandFactories/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { CommitDetails, FileCommitDetails, ICommand, IUiService } from './types';

const allBranches = '$(git-branch) All branches';
const currentBranch = '$(git-branch) Current branch';

type WorkspaceGitRoot = { workspaceFolder: string; gitRoot: string };
@injectable()
export class UiService implements IUiService {
    private selectionActionToken?: CancellationTokenSource;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer,
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
    public async getWorkspaceFolder(uri?: Uri): Promise<WorkspaceGitRoot | undefined> {
        let workspaceFolder: string | undefined;
        const workspaceService = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        if (uri) {
            const workspaceFolderUri = workspaceService.getWorkspaceFolder(uri);
            if (workspaceFolderUri) {
                workspaceFolder = workspaceFolderUri.uri.fsPath;
            }
        }
        if (!Array.isArray(workspaceService.workspaceFolders) || workspaceService.workspaceFolders.length === 0) {
            this.serviceContainer.get<IApplicationShell>(IApplicationShell).showInformationMessage('Please open a workspace folder');
            return;
        }

        const firstWorkspaceFolder = workspaceService.workspaceFolders[0]!.uri.fsPath;
        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(firstWorkspaceFolder, firstWorkspaceFolder);
        const gitRoots = await gitService.getGitRoots(workspaceFolder);
        // Filter to get only those that belong to a workspace folder
        const filteredGitRoots = gitRoots
            .map(gitRoot => {
                const workspaceFolderUri = workspaceService.getWorkspaceFolder(Uri.file(gitRoot));
                if (workspaceFolderUri) {
                    return {
                        workspaceFolder: workspaceFolderUri.uri.fsPath,
                        gitRoot
                    };
                }
                return;
            })
            .filter(item => !!item)
            .map(item => item!);

        switch (filteredGitRoots.length) {
            case 0: {
                return { workspaceFolder: firstWorkspaceFolder, gitRoot: firstWorkspaceFolder };
            }
            case 1: {
                return filteredGitRoots[0]!;
            }
            default: {
                return this.selectGitRoot(filteredGitRoots);
            }
        }
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
    private async selectGitRoot(workspaceGitRoots: WorkspaceGitRoot[]) {
        const app = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
        type itemType = QuickPickItem & WorkspaceGitRoot;
        const pickList: itemType[] = workspaceGitRoots.map(item => {
            return {
                ...item,
                label: path.basename(item.gitRoot),
                detail: item.gitRoot
            };
        });
        const options = {
            canPickMany: false, matchOnDescription: true,
            matchOnDetail: true, placeHolder: 'Select a Git Repository'
        };
        const selectedItem = await app.showQuickPick(pickList, options);
        if (selectedItem) {
            return selectedItem;
        }
        return;
    }

}
