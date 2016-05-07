'use strict';

import * as vscode from 'vscode';
import Provider from './provider';
let spawn = require('child_process').spawn;
let lodash = require('lodash');


export function activate(context: vscode.ExtensionContext) {

    let previewUri = vscode.Uri.parse('markdown://particularMarkdown');

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
        private _provider = new Provider();

        public provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText();
            let location = editor.document.fileName;           
            return this._provider.Process(text, location);
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }
    }
    
    let provider = new TextDocumentContentProvider();
    
    let registration = vscode.workspace.registerTextDocumentContentProvider('markdown', provider);

    vscode.workspace.onDidChangeTextDocument( lodash.debounce((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    }), 1000);

    let disposable = vscode.commands.registerCommand('particularMarkdown.showMarkdown', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });

    });
    context.subscriptions.push(disposable, registration);
}

export function deactivate() {
}