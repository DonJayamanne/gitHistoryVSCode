import * as vscode from 'vscode';
import { CommitProvider } from './commitProvider';
import { LogEntry } from '../contracts';
import * as gitHistory from '../helpers/gitHistory';
import { FileStatNode, LogEntryNode } from './LogEntryNode';
import * as historyUtil from '../helpers/historyUtils';
import { getFile, viewFile, diffFiles, viewLog } from '../commands/fileHistory';
import * as path from 'path';

let provider: CommitProvider;
let getGitRepoPath: () => string;
export function activate(context: vscode.ExtensionContext, gitPath: () => string) {
    getGitRepoPath = gitPath;
    vscode.commands.registerCommand('git.viewTreeView', (branch: string, sha: string) => showCommitInTreeView(branch, sha));
    getGitRepoPath = getGitRepoPath;

    vscode.commands.registerCommand('git.commit.LogEntry.ViewChangeLog', async (node: LogEntryNode | FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const data = await historyUtil.getFileHistoryBefore(gitRepoPath, node.logEntry.fileStats[0].path, node.logEntry.committer.date.toISOString());
        const historyItem = data.find(data => data.sha1 === node.logEntry.sha1.full);
        if (historyItem) {
            viewLog(historyItem);
        }
    });
    vscode.commands.registerCommand('git.commit.FileEntry.ViewFileContents', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const filePath = await getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        await viewFile(filePath);
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstWorkspace', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const filePath = await getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        await diffFiles(workspaceFile, filePath, node.logEntry.sha1.full, workspaceFile, '');
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstPrevious', async (node: FileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const data = await historyUtil.getFileHistoryBefore(gitRepoPath, node.fileStat.path, node.logEntry.committer.date.toISOString());
        const filePath = await getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        const previousItems = data.filter(data => data.sha1 !== node.logEntry.sha1.full);
        if (previousItems.length > 0) {
            const previousFile = await getFile(previousItems[0].sha1, gitRepoPath, node.fileStat.path);
            await diffFiles(workspaceFile, previousFile, previousItems[0].sha1, filePath, node.logEntry.sha1.full);
        }
    });

}
export function showLogEntries(entries: LogEntry[]) {
    const provider = createCommitProvider();
    provider.clear();
    entries.forEach(entry => provider.addLogEntry(entry));
    provider.refresh();
}
function createCommitProvider(): CommitProvider {
    if (provider) {
        return provider;
    }
    provider = new CommitProvider();
    vscode.window.registerTreeDataProvider('commitViewProvider', provider);
    return provider;
}
function showCommitInTreeView(branch: string, sha: string): Promise<any> | undefined {
    const provider = createCommitProvider();
    return getCommitDetails(provider, branch, sha);
}
function getCommitDetails(provider: CommitProvider, branch: string, sha: string): Promise<any> {
    const gitRepoPath = getGitRepoPath();
    return gitHistory.getLogEntries(gitRepoPath, branch, '', 0, 1, sha)
        .then(entries => {
            entries.forEach(entry => provider.addLogEntry(entry));
            provider.refresh();
        })
        .catch(ex => {
            console.error(ex);
            return;
        });
}