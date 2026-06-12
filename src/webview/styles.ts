/**
 * styles.ts
 * All CSS for the BBT webview panel.
 */

/* Base layout & inputs */
const baseStyles = `
    * {
        box-sizing: border-box; margin: 0; padding: 0;
    }

    body {
        font-family: var(--vscode-font-family);
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        padding: 16px;
        min-height: 100vh;
    }

    @media (max-width: 400px) {
        body { padding: 12px; }
        .result-card { padding: 12px; gap: 8px; }
        .result-value { font-size: 13px; }
    }

    h1 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--vscode-titleBar-activeForeground, #fff);
    }

    .input-group {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
    }

    input[type="text"] {
        flex: 1;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border, #555);
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 14px;
        font-family: var(--vscode-editor-font-family, monospace);
        outline: none;
        transition: border-color 0.2s;
    }

    input[type="text"]:focus {
        border-color: var(--vscode-focusBorder, #007acc);
    }

    input[type="text"].error {
        border-color: #f44747;
    }

    .error-msg {
        color: #f44747;
        font-size: 11px;
        min-height: 16px;
        margin-bottom: 12px;
    }
`;

/* Mode switcher (Number ↔ ASCII) */
const modeSwitcherStyles = `
    .mode-switcher {
        display: flex;
        gap: 2px;
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 6px;
        padding: 2px;
        margin-bottom: 16px;
    }

    .mode-btn {
        flex: 1;
        text-align: center;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        transition: all 0.15s;
        font-family: var(--vscode-font-family);
    }

    .mode-btn:hover {
        background: var(--vscode-list-hoverBackground, #3c3c3c);
    }

    .mode-btn.active {
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #fff);
    }
`;

/* ASCII char cards & conversions */
const asciiStyles = `
    .ascii-chars {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
    }

    .ascii-char-card {
        background: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 4px;
        padding: 4px 8px;
        min-width: 60px;
        text-align: center;
        cursor: pointer;
        transition: background 0.15s;
    }

    .ascii-char-card:hover {
        background: var(--vscode-list-hoverBackground, #3c3c3c);
    }

    .ascii-char {
        font-size: 18px;
        font-weight: 600;
        font-family: monospace;
    }

    .ascii-code {
        font-size: 10px;
        opacity: 0.6;
        margin-top: 2px;
    }

    .ascii-preview {
        font-family: monospace;
        font-size: 13px;
        word-break: break-all;
    }

    .ascii-conversion-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .ascii-conversion-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        opacity: 0.5;
        min-width: 52px;
    }

    .ascii-arrow {
        color: #569cd6;
        font-size: 12px;
    }
`;

/* Operator cheatsheet */
const cheatsheetStyles = `
    .cheatsheet {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 16px;
        align-items: center;
    }

    .op {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 3px;
        padding: 2px 8px;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 12px;
        cursor: default;
        user-select: none;
        transition: background 0.15s;
    }

    .op:hover {
        background: var(--vscode-list-hoverBackground, #3c3c3c);
    }

    .sep {
        width: 1px;
        height: 16px;
        background: var(--vscode-panel-border, #3c3c3c);
        margin: 0 4px;
    }
`;

/* Result cards (DEC / HEX / BIN) */
const resultStyles = `
    .results {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .result-card {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 6px;
        padding: 12px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }

    .result-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        min-width: 35px;
        padding-top: 2px;
        opacity: 0.6;
    }

    .result-label.dec   { color: #4ec9b0; }
    .result-label.hex   { color: #569cd6; }
    .result-label.bin   { color: #ce9178; }
    .result-label.ascii { color: #dcdcaa; }

    .result-value {
        font-family: var(--vscode-editor-font-family, 'Courier New', monospace);
        font-size: 13px;
        word-break: break-all;
        flex: 1;
        line-height: 1.4;
    }

    .copy-btn {
        background: transparent;
        border: 1px solid var(--vscode-button-secondaryBackground, #555);
        color: var(--vscode-button-secondaryForeground, #ccc);
        border-radius: 3px;
        padding: 3px 8px;
        font-size: 10px;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s;
    }

    .copy-btn:hover {
        background: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    .copy-btn.copied {
        color: #4ec9b0;
        border-color: #4ec9b0;
    }

    .bin-groups {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
    }

    .bin-byte {
        background: var(--vscode-editor-background);
        border-radius: 3px;
        padding: 1px 4px;
        font-size: 11px;
        letter-spacing: 1px;
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
    }
`;

/* Section wrapper */
const sectionStyles = `
    .section {
        margin-top: 24px;
        border-top: 1px solid var(--vscode-panel-border, #3c3c3c);
        padding-top: 16px;
    }

    .section-title {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        opacity: 0.45;
        margin-bottom: 10px;
    }
`;

/* Integer type grid */
const intTypeStyles = `
    .type-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .type-card {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 5px;
        padding: 8px 12px;
        font-size: 11px;
    }

    .type-card .type-name {
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 1px;
        opacity: 0.5;
        margin-bottom: 2px;
    }

    .type-card .type-value {
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 12px;
        color: var(--vscode-terminal-ansiGreen, #4ec9b0);
    }

    .type-card.overflow .type-value {
        color: var(--vscode-terminal-ansiRed, #f44747);
    }

    .type-card.exact .type-name {
        color: var(--vscode-terminal-ansiGreen, #4ec9b0);
    }
`;

/* Bit visualizer */
const bitGridStyles = `
    .bit-grid-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .bit-index-row, .bit-row {
        display: flex;
        gap: 3px;
        flex-wrap: wrap;
        align-items: center;
    }

    .bit-index {
        width: 18px;
        font-size: 8px;
        text-align: center;
        opacity: 0.3;
        font-family: monospace;
    }

    .bit-index.sep {
        width: 6px;
    }

    .bit-cell {
        width: 18px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 11px;
        border-radius: 3px;
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        cursor: default;
        user-select: none;
        transition: background 0.1s;
    }

    .bit-cell.on {
        background: #264f78;
        border-color: #569cd6;
        color: #9cdcfe;
        font-weight: 700;
    }

    .bit-cell.sep {
        width: 6px;
        background: transparent;
        border: none;
    }
`;

/* Endianness */
const endianStyles = `
    .endian-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .endian-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 12px;
    }

    .endian-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        opacity: 0.5;
        min-width: 52px;
    }

    .endian-bytes {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .endian-byte {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 12px;
    }

    .endian-byte.highlight {
        border-color: #569cd6;
        color: #9cdcfe;
    }
`;

/* History */
const historyStyles = `
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 160px;
        overflow-y: auto;
    }

    .history-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 10px;
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 11px;
        transition: background 0.15s;
    }

    .history-item:hover {
        background: var(--vscode-list-hoverBackground, #3c3c3c);
    }

    .history-expr {
        flex: 1;
        opacity: 0.7;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .history-result {
        color: #4ec9b0;
        white-space: nowrap;
    }

    .history-empty {
        font-size: 11px;
        opacity: 0.35;
        text-align: center;
        padding: 8px 0;
    }

    .history-clear {
        font-size: 10px;
        background: transparent;
        border: none;
        color: var(--vscode-button-secondaryForeground, #ccc);
        cursor: pointer;
        opacity: 0.4;
        padding: 0;
        float: right;
    }

    .history-clear:hover {
        opacity: 0.8;
    }

    /* Float info message */
    .float-info {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border-left: 3px solid #569cd6;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 11px;
        margin-top: 8px;
    }

    .float-info .info-icon {
        color: #569cd6;
        font-weight: bold;
        margin-right: 6px;
    }
`;

/* Export */
export function getAllStyles(): string {
    return [
        baseStyles,
        modeSwitcherStyles,
        asciiStyles,
        cheatsheetStyles,
        resultStyles,
        sectionStyles,
        intTypeStyles,
        bitGridStyles,
        endianStyles,
        historyStyles,
    ].join('\n');
}