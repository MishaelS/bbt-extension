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

function getWorkspaceStorageKey(): string
{
    const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length
        ? vscode.workspace.workspaceFolders[0].uri.toString()
        : 'no-workspace';

    return encodeURIComponent(folder);
}

function getKittenResourcePath(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const kittenDir = vscode.Uri.joinPath(extensionUri, 'resources', 'kitten', 'frame_original_cat');
    return webview.asWebviewUri(kittenDir).toString();
}

// Track all active webviews to broadcast kitten events
const activeWebviews: Set<vscode.Webview> = new Set();

// Classify which hand typed a character (mirrors kitten_logic.ts detectHand)
function detectHandServer(char: string): 'left' | 'right' | 'both' {
    if (!char || char.length === 0) return 'both';

    const leftChars  = '12345qwertasdfgzxcvbйцукефываопячсмит';
    const rightChars = '67890-=yuiop[]hjklnmнгшщзхъролджэтьбю.';

    const lowerChar = char.toLowerCase();
    if (leftChars.includes(lowerChar))  return 'left';
    if (rightChars.includes(lowerChar)) return 'right';
    return 'left';
}

function broadcastKittenKeystroke(hand: 'left' | 'right' | 'both'): void {
    for (const webview of activeWebviews) {
        try {
            webview.postMessage({ type: 'kitten_keystroke', hand });
        } catch {
            // webview may have been disposed
        }
    }
}

export function activate(context: vscode.ExtensionContext): void
{
    console.log('Byte Bit Tool is now active!');

    // Listen to text changes in any editor and animate the kitten
    const textChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        const changes = event.contentChanges;
        if (changes.length === 0) return;

        // Use the last typed character to determine hand
        const lastChange = changes[changes.length - 1];
        const text = lastChange.text;

        if (text.length === 0) {
            // Deletion (Backspace/Delete) → right hand
            broadcastKittenKeystroke('right');
        } else if (text === '\n' || text === '\r\n') {
            // Enter → right hand
            broadcastKittenKeystroke('right');
        } else if (text === '\t') {
            // Tab → left hand
            broadcastKittenKeystroke('left');
        } else {
            const hand = detectHandServer(text[text.length - 1]);
            broadcastKittenKeystroke(hand);
        }
    });

    context.subscriptions.push(textChangeListener);

    /* Panel command */
    const openCommand = vscode.commands.registerCommand('byte-bit-tool.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'byteBitTool',
            'Byte Bit Tool',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        panel.webview.html = buildWebviewDocument();

        const sendSettings = () => {
            const cfg           = vscode.workspace.getConfiguration('byteBitTool');
            const autoSave      = cfg.get<boolean>('autoSave', false);
            const kittenEnabled = cfg.get<boolean>('kittenEnabled', true);

            panel.webview.postMessage({ 
                type: 'settings', 
                autoSave, 
                workspaceKey: getWorkspaceStorageKey(),
                kittenEnabled,
                kittenResourcePath: getKittenResourcePath(panel.webview, context.extensionUri)
            });
        };

        sendSettings();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('byteBitTool.autoSave') || 
                e.affectsConfiguration('byteBitTool.kittenEnabled')) {
                sendSettings();
            }
        });

        // Register webview for kitten broadcasts
        activeWebviews.add(panel.webview);
        panel.onDidDispose(() => {
            activeWebviews.delete(panel.webview);
            console.log('Byte Bit Tool panel disposed');
        });
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
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.html = buildWebviewDocument();

        const sendSettings = () => {
            const cfg           = vscode.workspace.getConfiguration('byteBitTool');
            const autoSave      = cfg.get<boolean>('autoSave', false);
            const kittenEnabled = cfg.get<boolean>('kittenEnabled', true);

            webviewView.webview.postMessage({ 
                type: 'settings', 
                autoSave, 
                workspaceKey: getWorkspaceStorageKey(),
                kittenEnabled,
                kittenResourcePath: getKittenResourcePath(webviewView.webview, this.extensionUri)
            });
        };

        sendSettings();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('byteBitTool.autoSave') || 
                e.affectsConfiguration('byteBitTool.kittenEnabled')) {
                sendSettings();
            }
        });

        // Register webview for kitten broadcasts
        activeWebviews.add(webviewView.webview);
        webviewView.onDidDispose(() => {
            activeWebviews.delete(webviewView.webview);
        });

        webviewView.webview.onDidReceiveMessage(msg => {
            if (msg.command === 'copy') {
                vscode.env.clipboard.writeText(msg.text);
            }
        });
    }
}