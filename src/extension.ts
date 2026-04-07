import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';

export function activate(context: vscode.ExtensionContext) {
    console.log('Byte Bit Tool is now active!');

    // Registering the command to open in the main editor
    const openCommand = vscode.commands.registerCommand('byte-bit-tool.open', () => {
        console.log('Opening Byte Bit Tool panel');
        
        const panel = vscode.window.createWebviewPanel(
            'byteBitTool',
            'Byte Bit Tool',
            vscode.ViewColumn.One,
            { 
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent();
        
        panel.onDidDispose(() => {
            console.log('Byte Bit Tool panel disposed');
        });
    });

    // Registering the Webview View Provider for the sidebar
    // IMPORTANT: the id must match the id in the viewsContainers package.json
    const provider = new ByteBitToolViewProvider(context.extensionUri);
    const viewCommand = vscode.window.registerWebviewViewProvider('byte-bit-tool.view', provider);

    context.subscriptions.push(openCommand, viewCommand);
}

// Provider for display in sidebar
class ByteBitToolViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        console.log('Resolving Byte Bit Tool view');
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        
        // Installing HTML content directly in sidebar
        webviewView.webview.html = getWebviewContent();
        
        // Processing messages from webview (if necessary)
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'copy':
                    vscode.env.clipboard.writeText(message.text);
                    break;
            }
        });
    }
}

export function deactivate() {
    console.log('Byte Bit Tool is deactivated');
}