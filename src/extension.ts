import * as vscode from 'vscode';
// import * as fileHistory from './commands/fileHistory';
// import * as lineHistory from './commands/lineHistory';
import { CommandRegister } from './commands/register';
// import * as searchHistory from './commands/searchHistory';
// import * as commitComparer from './commitCompare/main';
// import * as commitViewer from './commitViewer/main';
// import * as logViewer from './logViewer/logViewer';
import { IGitHistoryViewer } from './commands/types';
import { gitHistorySchema } from './constants';
import { DiContainer } from './ioc/container';
import { setDiContainer } from './ioc/index';
import { ContentProvider } from './logViewer/contentProvider';

// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    const container = DiContainer.getInstance();
    setDiContainer(container);
    context.subscriptions.push(container);

    const provider = new ContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
    context.subscriptions.push(registration);

    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
    const logViewer = container.get<IGitHistoryViewer>(IGitHistoryViewer);
    context.subscriptions.push(logViewer);
    context.subscriptions.push(new CommandRegister());
}
