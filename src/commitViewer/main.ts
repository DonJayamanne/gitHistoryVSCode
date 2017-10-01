import * as path from 'path';
import * as vscode from 'vscode';
import { diffFiles, getFile, viewFile, viewLog } from '../commands/fileHistory';
import * as gitHistory from '../helpers/gitHistory';
import * as historyUtil from '../helpers/historyUtils';
import { LogEntry } from '../types';
import { CommitProvider } from './commitProvider';
import { FileStatNode, LogEntryNode } from './LogEntryNode';

let provider: CommitProvider;
let getGitRepoPath: () => string;
export function activate(context: vscode.ExtensionContext, gitPath: () => string) {
    getGitRepoPath = gitPath;
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    vscode.commands.registerCommand('git.viewTreeView', (branch: string, hash: string) => showCommitInTreeView(branch, hash));
    getGitRepoPath = getGitRepoPath;

    vscode.commands.registerCommand('git.commit.LogEntry.ViewChangeLog', async (node: LogEntryNode | FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const data = await historyUtil.getFileHistoryBefore(gitRepoPath, node.logEntry.fileStats[0].path, node.logEntry.committer.date.toISOString());
        const historyItem = data.find(item => item.hash === node.logEntry.hash.full);
        if (historyItem) {
            viewLog(historyItem);
        }
    });
    vscode.commands.registerCommand('git.commit.FileEntry.ViewFileContents', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const filePath = await getFile(node.logEntry.hash.full, gitRepoPath, node.fileStat.path);
        await viewFile(filePath);
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstWorkspace', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const filePath = await getFile(node.logEntry.hash.full, gitRepoPath, node.fileStat.path);
        await diffFiles(workspaceFile, filePath, node.logEntry.hash.full, workspaceFile, '');
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstPrevious', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const data = await historyUtil.getFileHistoryBefore(gitRepoPath, node.fileStat.path, node.logEntry.committer.date.toISOString());
        const filePath = await getFile(node.logEntry.hash.full, gitRepoPath, node.fileStat.path);
        const previousItems = data.filter(dataItem => dataItem.hash !== node.logEntry.hash.full);
        if (previousItems.length > 0) {
            const previousFile = await getFile(previousItems[0].hash, gitRepoPath, node.fileStat.path);
            await diffFiles(workspaceFile, previousFile, previousItems[0].hash, filePath, node.logEntry.hash.full);
        }
    });

}
export function showLogEntries(entries: LogEntry[]) {
    const commitProvider = createCommitProvider();
    commitProvider.clear();
    entries.forEach(entry => commitProvider.addLogEntry(entry));
    commitProvider.refresh();
}
function createCommitProvider(): CommitProvider {
    if (provider) {
        return provider;
    }
    provider = new CommitProvider();
    vscode.window.registerTreeDataProvider('commitViewProvider', provider);
    return provider;
}
// tslint:disable-next-line:no-any
function showCommitInTreeView(branch: string, hash: string): Promise<any> | undefined {
    const commitProvider = createCommitProvider();
    return getCommitDetails(commitProvider, branch, hash);
}
// tslint:disable-next-line:no-any
function getCommitDetails(commitProvider: CommitProvider, branch: string, hash: string): Promise<any> {
    const gitRepoPath = getGitRepoPath();
    return gitHistory.getLogEntries(gitRepoPath, branch, '', 0, 1, hash)
        .then(entries => {
            entries.forEach(entry => commitProvider.addLogEntry(entry));
            commitProvider.refresh();
        })
        .catch(ex => {
            console.error(ex);
            return;
        });
}
