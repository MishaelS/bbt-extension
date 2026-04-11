/**
 * extension.ts
 * Entry point for the BBT VS Code extension.
 *
 * Responsibilities:
 *   - Register the "Open panel" command
 *   - Register the sidebar WebviewView provider
 *   - Register the hover provider
 *
 * Module layout:
 *   src/hover.ts                — hover provider
 *   src/webview/index.ts        — HTML assembly
 *   src/webview/styles.ts       — CSS
 *   src/webview/html.ts         — markup
 *   src/webview/number/logic.ts — number mode JS
 *   src/webview/ascii/logic.ts  — ASCII mode JS
 */
import * as vscode from 'vscode';
import { createHoverProvider } from './hover';
import { buildWebviewDocument } from './webview/index';

export function activate(context: vscode.ExtensionContext): void
{
    console.log('Byte Bit Tool is now active!');

    /* Panel command */
    const openCommand = vscode.commands.registerCommand('byte-bit-tool.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'byteBitTool',
            'Byte Bit Tool',
            vscode.ViewColumn.One,
            {
                enableScripts        : true,
                retainContextWhenHidden: true,
            }
        );
        panel.webview.html = buildWebviewDocument();

        const sendSettings = () => {
            const cfg      = vscode.workspace.getConfiguration('byteBitTool');
            const autoSave = cfg.get<boolean>('autoSave', false);
            panel.webview.postMessage({ type: 'settings', autoSave });
        };

        sendSettings();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('byteBitTool.autoSave')) {
                sendSettings();
            }
        });

        panel.onDidDispose(() => console.log('Byte Bit Tool panel disposed'));
    });

    /* Sidebar provider */
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    const viewCommand = vscode.window.registerWebviewViewProvider(
        'byte-bit-tool.view',
        sidebarProvider
    );

    /* Hover provider */
    const hoverProvider = createHoverProvider();

    context.subscriptions.push(openCommand, viewCommand, hoverProvider);
}

export function deactivate(): void
{
    console.log('Byte Bit Tool is deactivated');
}

/* Sidebar WebviewView provider */
class SidebarProvider implements vscode.WebviewViewProvider
{
    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = {
            enableScripts    : true,
            localResourceRoots: [this.extensionUri],
        };

        webviewView.webview.html = buildWebviewDocument();

        const sendSettings = () => {
            const cfg     = vscode.workspace.getConfiguration('byteBitTool');
            const autoSave = cfg.get<boolean>('autoSave', false);
            webviewView.webview.postMessage({ type: 'settings', autoSave });
        };

        sendSettings();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('byteBitTool.autoSave')) {
                sendSettings();
            }
        });

        webviewView.webview.onDidReceiveMessage(msg => {
            if (msg.command === 'copy') {
                vscode.env.clipboard.writeText(msg.text);
            }
        });
    }
}