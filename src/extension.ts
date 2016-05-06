'use strict';

import * as vscode from 'vscode';
let spawn = require('child_process').spawn;

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
    
     class Provider {
         private _ipc : any;
         private _promise : Promise<string>;
         _resolver : any; 
         private _response : string;
        
         constructor()
         {
             let processEnv = process.env.MARKDOWN_CONSOLE || "C:\\Git\\particularmarkdown\\ParticularDocsCore\\MarkdownConsole.exe";
             this._ipc = spawn(processEnv);
          
             this._ipc.stdout.on('data', (data) => {
                 console.log("Getting something back");
                 
                 this._response += data.toString();
                                                
                 if (this._response.endsWith('|||')) {
                    this._resolver(this._response.replace('|||', ''));
                    
                 
                    this._response = '';
                    this._promise = new Promise<string>((resolve, reject) => {
                        this._resolver = resolve;
                    });
                 }
            }); 
            
            this._promise = new Promise<string>((resolve, reject) => {
                this._resolver = resolve;
            });
         }
        
         public Process(text : string, filename : string): Promise<string> {
             var message = { location: filename.toLowerCase(), markdown: text };
           
             this._ipc.stdin.write(JSON.stringify(message) + "\n");
                      
             return this._promise;
         }
     }

    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('markdown', provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(previewUri);
        }
    })

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