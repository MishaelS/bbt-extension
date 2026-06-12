import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting tests...');

    test('Extension should be activated', () => {
        const extension = vscode.extensions.getExtension('mishaels.byte-bit-tool');
        assert.ok(extension);
        assert.strictEqual(extension?.isActive, true);
    });

    test('Command should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('byte-bit-tool.open'));
    });

    test('Hover provider should work with float numbers', async () => {
        // Create a test document
        const document = await vscode.workspace.openTextDocument({
            content: 'const pi = 3.14;',
            language: 'javascript'
        });

        // Get hover at position of '3.14'
        const position = new vscode.Position(0, 11);
        const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider',
            document.uri,
            position
        );

        // Should have at least one hover
        assert.ok(hover && hover.length > 0);
    });
});