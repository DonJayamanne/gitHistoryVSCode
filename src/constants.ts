import { Uri } from 'vscode';

export const gitHistorySchema = 'git-history-viewer';
export const previewUri = Uri.parse(`${gitHistorySchema}://authority/git-history`);
export const extensionId = 'donjayamanne.githistory';
export const appinsightsKey = 'd6a4de02-e0fa-4515-be3d-7fe0ffa2f488';

// Will be set in extension activation.
type ExtensionRoot = { path?: string };
export const extensionRoot: ExtensionRoot = { path: '' };
