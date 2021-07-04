// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

// tslint:disable:no-invalid-this no-require-imports no-var-requires no-any

import * as TypeMoq from 'typemoq';
import * as vscode from 'vscode';
import * as vscodeMocks from './vsc';

type VSCode = typeof vscode;

const mockedVSCode: Partial<VSCode> = {};
export const mockedVSCodeNamespaces: { [P in keyof VSCode]?: TypeMoq.IMock<VSCode[P]> } = {};
// const originalLoad = Module._load;

function generateMock<K extends keyof VSCode>(name: K): void {
    const mockedObj = TypeMoq.Mock.ofType<VSCode[K]>();
    (mockedVSCode as any)[name] = mockedObj.object;
    mockedVSCodeNamespaces[name] = mockedObj as any;
}

class MockClipboard {
    private text = '';
    public readText(): Promise<string> {
        return Promise.resolve(this.text);
    }
    public async writeText(value: string): Promise<void> {
        this.text = value;
    }
}

export function initialize() {
    generateMock('workspace');
    generateMock('window');
    generateMock('commands');
    generateMock('languages');
    generateMock('env');
    generateMock('debug');
    generateMock('scm');

    // Use mock clipboard fo testing purposes.
    const clipboard = new MockClipboard();
    mockedVSCodeNamespaces.env?.setup(e => e.clipboard).returns(() => clipboard);

    return mockedVSCode;
}

mockedVSCode.Disposable = vscodeMocks.vscMock.Disposable as any;
mockedVSCode.CodeAction = vscodeMocks.vscMock.CodeAction;
mockedVSCode.EventEmitter = vscodeMocks.vscMock.EventEmitter;
mockedVSCode.CancellationTokenSource = vscodeMocks.vscMock.CancellationTokenSource;
// mockedVSCode.CompletionItemKind = vscodeMocks.vscMock.CompletionItemKind;
mockedVSCode.SymbolKind = vscodeMocks.vscMock.SymbolKind;
mockedVSCode.IndentAction = vscodeMocks.vscMock.IndentAction;
mockedVSCode.Uri = vscodeMocks.vscUri.URI as any;
mockedVSCode.Range = vscodeMocks.vscMockExtHostedTypes.Range;
mockedVSCode.Position = vscodeMocks.vscMockExtHostedTypes.Position;
mockedVSCode.Selection = vscodeMocks.vscMockExtHostedTypes.Selection;
mockedVSCode.Location = vscodeMocks.vscMockExtHostedTypes.Location;
mockedVSCode.SymbolInformation = vscodeMocks.vscMockExtHostedTypes.SymbolInformation;
mockedVSCode.CompletionItem = vscodeMocks.vscMockExtHostedTypes.CompletionItem;
// mockedVSCode.CompletionItemKind = vscodeMocks.vscMockExtHostedTypes.CompletionItemKind;
mockedVSCode.CodeLens = vscodeMocks.vscMockExtHostedTypes.CodeLens;
mockedVSCode.DiagnosticSeverity = vscodeMocks.vscMockExtHostedTypes.DiagnosticSeverity;
mockedVSCode.SnippetString = vscodeMocks.vscMockExtHostedTypes.SnippetString;
mockedVSCode.ConfigurationTarget = vscodeMocks.vscMockExtHostedTypes.ConfigurationTarget;
mockedVSCode.StatusBarAlignment = vscodeMocks.vscMockExtHostedTypes.StatusBarAlignment;
mockedVSCode.SignatureHelp = vscodeMocks.vscMockExtHostedTypes.SignatureHelp;
mockedVSCode.DocumentLink = vscodeMocks.vscMockExtHostedTypes.DocumentLink;
mockedVSCode.TextEdit = vscodeMocks.vscMockExtHostedTypes.TextEdit;
mockedVSCode.WorkspaceEdit = vscodeMocks.vscMockExtHostedTypes.WorkspaceEdit;
mockedVSCode.RelativePattern = vscodeMocks.vscMockExtHostedTypes.RelativePattern;
mockedVSCode.ProgressLocation = vscodeMocks.vscMockExtHostedTypes.ProgressLocation;
mockedVSCode.ViewColumn = vscodeMocks.vscMockExtHostedTypes.ViewColumn;
mockedVSCode.TextEditorRevealType = vscodeMocks.vscMockExtHostedTypes.TextEditorRevealType;
mockedVSCode.TreeItem = vscodeMocks.vscMockExtHostedTypes.TreeItem;
mockedVSCode.TreeItemCollapsibleState = vscodeMocks.vscMockExtHostedTypes.TreeItemCollapsibleState;
mockedVSCode.CodeActionKind = vscodeMocks.vscMock.CodeActionKind;
mockedVSCode.DebugAdapterExecutable = vscodeMocks.vscMock.DebugAdapterExecutable;
mockedVSCode.DebugAdapterServer = vscodeMocks.vscMock.DebugAdapterServer;
// mockedVSCode.QuickInputButtons = vscodeMocks.vscMockExtHostedTypes.QuickInputButtons;
mockedVSCode.FileType = vscodeMocks.vscMock.FileType;
// mockedVSCode.FileSystemError = vscodeMocks.vscMockExtHostedTypes.FileSystemError;

// This API is used in src/client/telemetry/telemetry.ts
const extensions = TypeMoq.Mock.ofType<typeof vscode.extensions>();
extensions.setup(e => e.all).returns(() => []);
const extension = TypeMoq.Mock.ofType<vscode.Extension<any>>();
const packageJson = TypeMoq.Mock.ofType<any>();
const contributes = TypeMoq.Mock.ofType<any>();
extension.setup(e => e.packageJSON).returns(() => packageJson.object);
packageJson.setup(p => p.contributes).returns(() => contributes.object);
contributes.setup(p => p.debuggers).returns(() => [{ aiKey: '' }]);
extensions.setup(e => e.getExtension(TypeMoq.It.isAny())).returns(() => extension.object);
mockedVSCode.extensions = extensions.object;
