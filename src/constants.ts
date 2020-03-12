import { Uri } from 'vscode';

export const gitHistorySchema = 'git-history-viewer';
export const previewUri = Uri.parse(`${gitHistorySchema}://authority/git-history`);
export const extensionId = 'donjayamanne.githistory';
export const appinsightsKey = '5c0ad3fd-00a1-42be-bc1a-82812eb01b67';

// Will be set in extension activation.
type ExtensionRoot = { path?: string };
export const extensionRoot: ExtensionRoot = { path: '' };
