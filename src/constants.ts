import { Uri } from 'vscode';

export const gitHistorySchema = 'git-history-viewer';
export const gitHistoryFileViewerSchema = 'git-file-viewer';
export const previewUri = Uri.parse(`${gitHistorySchema}://authority/git-history`);
