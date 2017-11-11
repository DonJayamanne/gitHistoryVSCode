import { injectable } from 'inversify';
import { commands, Disposable, Uri, ViewColumn, window } from 'vscode';
import { IFileStatParser } from '../adapter/parsers/types';
import { command } from '../commands/register';
import { IUiService } from '../common/types';
import {gitHistoryFileViewerSchema, previewUri} from '../constants';
import { IServiceContainer } from '../ioc/types';
import { IServerHost, IWorkspaceQueryStateStore } from '../server/types';
import { BranchSelection, IGitServiceFactory } from '../types';
import { IGitHistoryCommandHandler } from './types';

@injectable()
export class GitHistoryCommandHandler implements IGitHistoryCommandHandler {
    private disposables: Disposable[] = [];
    private server: IServerHost;
    constructor(private serviceContainer: IServiceContainer) {
        this.disposables.push(commands.registerCommand('git.viewHistory', this.viewHistory, this));
    }
    public dispose() {
        if (this.server) {
            this.server.dispose();
        }
        this.disposables.forEach(disposable => disposable.dispose());
    }

    @command('git.viewHistory', IGitHistoryCommandHandler)
    public async viewHistory() {
        this.doMore('/Users/donjayamanne/Desktop/Development/myvscode', '0c76aa91e34ceda769a028036cfe31c7eb1b751a');
        this.doMore('/Users/donjayamanne/Desktop/Development/myvscode', '0c76aa91e34ceda769a028036cfe31c7eb1b751a');
        // const fileStatParserFactory = this.serviceContainer.get<IFileStatParser>(IFileStatParser);

        // // tslint:disable-next-line:no-console
        // console.log(fileStatParserFactory);
        // this.server = this.server || this.serviceContainer.get<IServerHost>(IServerHost);
        // const uiService = this.serviceContainer.get<IUiService>(IUiService);
        // const workspaceFolder = await uiService.getWorkspaceFolder();
        // if (!workspaceFolder) {
        //     return undefined;
        // }
        // const branchSelection = await uiService.getBranchSelection();
        // if (branchSelection === undefined) {
        //     return;
        // }
        // const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        // const branchName = await gitService.getCurrentBranch();
        // const title = branchSelection === BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
        // const startupInfo = await this.server.start(workspaceFolder);
        // const id = Date.now().toString();
        // await this.serviceContainer.get<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore).initialize(id, workspaceFolder, branchName, branchSelection);
        // const locale = process.env.language || '';
        // const queryArgs = [
        //     `id=${id}`, `port=${startupInfo.port}`,
        //     `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
        // ];
        // if (branchSelection === BranchSelection.Current) {
        //     queryArgs.push(`branchName=${encodeURIComponent(branchName)}`);
        // }
        // const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
        // commands.executeCommand('vscode.previewHtml', uri, ViewColumn.One, title);
    }

    private async doMore(workspaceFolder: string, hash: string) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        const logEntry = await gitService.getCommit(hash);
        // tslint:disable-next-line:no-console
        console.log(logEntry);
        // const tmpFile = await gitService.getCommitFile(hash, commitedFile.uri);
        // // const doc = await workspace.openTextDocument(tmpFile as Uri);

        // const args = [
        //     `workspaceFolder=${encodeURIComponent(workspaceFolder)}`,
        //     `hash=${hash}`,
        //     `fsPath=${encodeURIComponent(commitedFile.uri.fsPath)}`
        // ];
        // const ext = path.extname(commitedFile.relativePath);
        const uri = Uri.parse(`${gitHistoryFileViewerSchema}://234/234.py`);

        // await window.showTextDocument(doc, ViewColumn.Two, false);
        window.showTextDocument(uri, { preserveFocus: true, preview: true, viewColumn: ViewColumn.Two });
    }
}
