// import { getGitRepositoryPath } from '../helpers/gitPaths';
import * as path from 'path';
// import { getGitRepositoryPath } from '../helpers/gitPaths';
import * as vscode from 'vscode';
import { diffFiles, getFile } from '../commands/fileHistory';
import { LogEntryNode } from '../commitViewer/logEntryNode';
import { formatDate } from '../common/helpers';
import { getDiff } from '../helpers/gitDiff';
import { getLogEntries } from '../helpers/gitHistory';
import { LogEntry } from '../types';
import { CommitCompareProvider } from './commitCompareProvider';
import { CompareFileStatNode } from './logEntryNode';

let provider: CommitCompareProvider;
let getGitRepoPath: () => string;

export function activate(context: vscode.ExtensionContext, gitPath: () => string) {
    vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', false);
    getGitRepoPath = gitPath;

    let leftSelectedNode: LogEntry;
    vscode.commands.registerCommand('git.commit.compare', async (branch: string, hash: string) => {
        const gitRepoPath = await getGitRepoPath();
        const entries = await getLogEntries(gitRepoPath, branch, '', undefined, undefined, hash);
        if (!entries || entries.length === 0) {
            return;
        }
        const logEntry = entries[0];
        const items: vscode.QuickPickItem[] = [
            {
                label: 'Select for compare',
                description: `${logEntry.author!.email} on ${formatDate(logEntry.author!.date)}`,
                detail: logEntry.subject
            }
        ];
        if (leftSelectedNode) {
            items.push({
                label: 'Compare with selected commit',
                description: `${logEntry.author!.email} on ${formatDate(logEntry.author!.date)}`,
                detail: logEntry.subject
            });
        }

        vscode.window.showQuickPick(items).then(selection => {
            if (!selection) {
                return;
            }
            if (selection.label === 'Select for compare') {
                leftSelectedNode = logEntry;
            }
            if (selection.label === 'Compare with selected commit') {
                return showComparisonInformation(leftSelectedNode, logEntry);
            }
            return;
        });
    });
    vscode.commands.registerCommand('git.commit.compare.selectLeftCommit', async (node: LogEntryNode) => {
        leftSelectedNode = node.logEntry;
        await vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', true);
    });
    vscode.commands.registerCommand('git.commit.compare.compareAgainstSelectedCommit', async (node: LogEntryNode) => {
        await showComparisonInformation(leftSelectedNode, node.logEntry);
    });
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstCommit', async (node: CompareFileStatNode) => {
        const gitRepoPath = await getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const leftFilePath = await getFile(node.logEntry.hash.full, gitRepoPath, node.fileStat.path);
        const rightFilePath = await getFile(node.rightLogEntry.hash.full, gitRepoPath, node.fileStat.path);
        await diffFiles(workspaceFile, rightFilePath, node.rightLogEntry.hash.full, leftFilePath, node.logEntry.hash.full);
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
    const diff = await getDiff(gitRepoPath, leftNode.hash.full, rightNode.hash.full);
    if (diff.length === 0) {
        return;
    }

    // Dirty hack
    const clonedLeftNode: LogEntry = JSON.parse(JSON.stringify(leftNode));
    clonedLeftNode.fileStats = diff[0].fileStats;

    // tslint:disable-next-line:no-shadowed-variable
    const provider = createCommitCompareProvider();
    provider.setComparisonEntries(clonedLeftNode, rightNode);
    provider.refresh();
}
