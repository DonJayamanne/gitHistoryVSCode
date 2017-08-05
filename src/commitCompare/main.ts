import { LogEntry } from '../contracts';
// import { getGitRepositoryPath } from '../helpers/gitPaths';
import * as vscode from 'vscode';
// import { CommitProvider } from './commitProvider';
// import { LogEntry } from '../contracts';
import { getDiff } from '../helpers/gitDiff';
import { LogEntryNode } from '../commitViewer/logEntryNode';
import { CompareFileStatNode } from './logEntryNode';
import { CommitCompareProvider } from './commitCompareProvider';
import { getFile, diffFiles } from '../commands/fileHistory';
import * as path from 'path';

let provider: CommitCompareProvider;
let getGitRepoPath: () => string;

export function activate(context: vscode.ExtensionContext, gitPath: () => string) {
    vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', false);
    getGitRepoPath = gitPath;

    let lastSelectedSha1 = '';
    let leftSelectedNode: LogEntry;

    vscode.commands.registerCommand('git.commit.compare.selectLeftCommit', async (node: LogEntryNode) => {
        lastSelectedSha1 = node.logEntry.sha1.full;
        leftSelectedNode = node.logEntry;
        await vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', true);
    });
    vscode.commands.registerCommand('git.commit.compare.compareAgainstSelectedCommit', async (node: LogEntryNode) => {
        const rightSha1 = node.logEntry.sha1.full;
        await showComparisonInformation(leftSelectedNode, node.logEntry);
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstCommit', async (node: CompareFileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const leftFilePath = await getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        const rightFilePath = await getFile(node.rightLogEntry.sha1.full, gitRepoPath, node.fileStat.path);
        await diffFiles(workspaceFile, rightFilePath, node.rightLogEntry.sha1.full, leftFilePath, node.logEntry.sha1.full);
    });

}
function createCommitCompareProvider(): CommitCompareProvider {
    if (provider) {
        return provider;
    }
    provider = new CommitCompareProvider();
    vscode.window.registerTreeDataProvider('compareViewProvider', provider);
    return provider;
}
async function showComparisonInformation(leftNode: LogEntry, rightNode: LogEntry) {
    const gitRepoPath = await getGitRepoPath();
    const diff = await getDiff(gitRepoPath, leftNode.sha1.full, rightNode.sha1.full);
    if (diff.length === 0) {
        return;
    }

    // Dirty hack
    const clonedLeftNode: LogEntry = JSON.parse(JSON.stringify(leftNode));
    clonedLeftNode.fileStats = diff[0].fileStats;
    console.log(diff);

    const provider = createCommitCompareProvider();
    provider.setComparisonEntries(clonedLeftNode, rightNode);
    provider.refresh();
}
