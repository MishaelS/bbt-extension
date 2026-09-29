import * as vscode from 'vscode';
import {
    normalizeOffsetRanges,
    OffsetRange,
    subtractOffsetRanges,
    updateOffsetRanges
} from './rangeTracker';

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'red';

interface PaletteEntry
{
    id: HighlightColor;
    label: string;
    description: string;
    overviewColor: string;
    darkForeground: string;
    lightForeground: string;
    darkBackground: string;
    lightBackground: string;
}

const PALETTE: PaletteEntry[] = [
    {
        id: 'yellow', label: 'Yellow', description: 'Warnings and important notes',
        overviewColor: '#E5C07B', darkForeground: '#FFE08A', lightForeground: '#725500',
        darkBackground: '#E5C07B24', lightBackground: '#E5C07B38'
    },
    {
        id: 'green', label: 'Green', description: 'Verified or completed text',
        overviewColor: '#4EC9B0', darkForeground: '#73E6CC', lightForeground: '#006B58',
        darkBackground: '#4EC9B024', lightBackground: '#4EC9B038'
    },
    {
        id: 'blue', label: 'Blue', description: 'References and related text',
        overviewColor: '#569CD6', darkForeground: '#86C7FF', lightForeground: '#005A9E',
        darkBackground: '#569CD624', lightBackground: '#569CD638'
    },
    {
        id: 'pink', label: 'Pink', description: 'Questions and review points',
        overviewColor: '#FF7AB2', darkForeground: '#FF9CC8', lightForeground: '#A31555',
        darkBackground: '#FF7AB224', lightBackground: '#FF7AB238'
    },
    {
        id: 'purple', label: 'Purple', description: 'Architecture and design notes',
        overviewColor: '#C586C0', darkForeground: '#DDB0DA', lightForeground: '#7A2675',
        darkBackground: '#C586C024', lightBackground: '#C586C038'
    },
    {
        id: 'red', label: 'Red', description: 'Errors and critical text',
        overviewColor: '#F44747', darkForeground: '#FF7B72', lightForeground: '#A31515',
        darkBackground: '#F4474724', lightBackground: '#F4474738'
    }
];

export class TextHighlightManager implements vscode.Disposable
{
    private readonly decorations = new Map<HighlightColor, vscode.TextEditorDecorationType>();
    private readonly highlights = new Map<string, Map<HighlightColor, OffsetRange[]>>();
    private readonly disposables: vscode.Disposable[] = [];

    constructor()
    {
        for (const entry of PALETTE) {
            this.decorations.set(entry.id, vscode.window.createTextEditorDecorationType({
                borderRadius: '2px',
                overviewRulerColor: entry.overviewColor,
                overviewRulerLane: vscode.OverviewRulerLane.Center,
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                dark: {
                    color: entry.darkForeground,
                    backgroundColor: entry.darkBackground
                },
                light: {
                    color: entry.lightForeground,
                    backgroundColor: entry.lightBackground
                }
            }));
        }

        this.disposables.push(
            vscode.commands.registerCommand('byte-bit-tool.highlightText', () => this.highlightText()),
            vscode.commands.registerCommand('byte-bit-tool.clearTextHighlight', () => this.clearTextHighlight()),
            vscode.commands.registerCommand('byte-bit-tool.clearAllTextHighlights', () => this.clearAllTextHighlights()),
            vscode.workspace.onDidChangeTextDocument(event => this.trackDocumentChanges(event)),
            vscode.window.onDidChangeVisibleTextEditors(editors => {
                for (const editor of editors) { this.render(editor); }
            })
        );
    }

    dispose(): void
    {
        for (const disposable of this.disposables) { disposable.dispose(); }
        for (const decoration of this.decorations.values()) { decoration.dispose(); }
        this.highlights.clear();
    }

    private async highlightText(): Promise<void>
    {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a text editor before highlighting text.');
            return;
        }

        const targets = this.getTargetRanges(editor);
        if (targets.length === 0) {
            vscode.window.showInformationMessage('Select text or place the cursor on a word.');
            return;
        }

        const picked = await vscode.window.showQuickPick(
            PALETTE.map(entry => ({
                label: entry.label,
                description: entry.description,
                color: entry.id
            })),
            { placeHolder: 'Choose a BBT text highlight color' }
        );
        if (!picked) { return; }

        const documentHighlights = this.getDocumentHighlights(editor.document.uri);
        for (const entry of PALETTE) {
            const current = documentHighlights.get(entry.id) ?? [];
            documentHighlights.set(entry.id, subtractOffsetRanges(current, targets));
        }

        const selectedColor = picked.color as HighlightColor;
        documentHighlights.set(
            selectedColor,
            normalizeOffsetRanges([...(documentHighlights.get(selectedColor) ?? []), ...targets])
        );
        this.renderDocument(editor.document.uri);
    }

    private clearTextHighlight(): void
    {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const targets = this.getTargetRanges(editor);
        if (targets.length === 0) {
            vscode.window.showInformationMessage('Select highlighted text or place the cursor on it.');
            return;
        }

        const documentHighlights = this.highlights.get(editor.document.uri.toString());
        if (!documentHighlights) { return; }

        for (const entry of PALETTE) {
            const current = documentHighlights.get(entry.id) ?? [];
            documentHighlights.set(entry.id, subtractOffsetRanges(current, targets));
        }
        this.renderDocument(editor.document.uri);
    }

    private clearAllTextHighlights(): void
    {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        this.highlights.delete(editor.document.uri.toString());
        this.renderDocument(editor.document.uri);
    }

    private getTargetRanges(editor: vscode.TextEditor): OffsetRange[]
    {
        const ranges: OffsetRange[] = [];
        for (const selection of editor.selections) {
            const range = selection.isEmpty
                ? editor.document.getWordRangeAtPosition(selection.active)
                : new vscode.Range(selection.start, selection.end);
            if (!range || range.isEmpty) { continue; }
            ranges.push({
                start: editor.document.offsetAt(range.start),
                end: editor.document.offsetAt(range.end)
            });
        }
        return normalizeOffsetRanges(ranges);
    }

    private getDocumentHighlights(uri: vscode.Uri): Map<HighlightColor, OffsetRange[]>
    {
        const key = uri.toString();
        let documentHighlights = this.highlights.get(key);
        if (!documentHighlights) {
            documentHighlights = new Map();
            this.highlights.set(key, documentHighlights);
        }
        return documentHighlights;
    }

    private trackDocumentChanges(event: vscode.TextDocumentChangeEvent): void
    {
        const documentHighlights = this.highlights.get(event.document.uri.toString());
        if (!documentHighlights) { return; }

        const changes = event.contentChanges.map(change => ({
            rangeOffset: change.rangeOffset,
            rangeLength: change.rangeLength,
            textLength: change.text.length
        }));
        for (const entry of PALETTE) {
            const current = documentHighlights.get(entry.id) ?? [];
            documentHighlights.set(entry.id, updateOffsetRanges(current, changes));
        }
        this.renderDocument(event.document.uri);
    }

    private renderDocument(uri: vscode.Uri): void
    {
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.uri.toString() === uri.toString()) {
                this.render(editor);
            }
        }
    }

    private render(editor: vscode.TextEditor): void
    {
        const documentHighlights = this.highlights.get(editor.document.uri.toString());
        for (const entry of PALETTE) {
            const decoration = this.decorations.get(entry.id);
            if (!decoration) { continue; }

            const options = (documentHighlights?.get(entry.id) ?? []).map(offsetRange => ({
                range: new vscode.Range(
                    editor.document.positionAt(offsetRange.start),
                    editor.document.positionAt(offsetRange.end)
                ),
                hoverMessage: `BBT highlight: ${entry.label}`
            }));
            editor.setDecorations(decoration, options);
        }
    }
}
