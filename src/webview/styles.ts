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
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 5px;
        padding: 8px;
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
        border-radius: 5px;
        padding: 10px 12px;
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

/* Binary Diff viewer */
const binaryDiffStyles = `
    .binary-input-panel {
        display: grid;
        grid-template-columns: 128px minmax(0, 1fr);
        gap: 8px;
        margin-bottom: 4px;
        align-items: stretch;
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 5px;
        padding: 8px;
    }

    .binary-name-input {
        min-height: 42px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        border-radius: 3px;
        padding: 5px 8px;
        font-size: 11px;
        font-family: var(--vscode-font-family);
        outline: none;
    }

    .binary-hex-input {
        min-height: 42px;
        max-height: 84px;
        resize: vertical;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        border-radius: 3px;
        padding: 5px 8px;
        font-size: 11px;
        line-height: 1.35;
        font-family: var(--vscode-editor-font-family, monospace);
        outline: none;
    }

    .binary-name-input:focus, .binary-hex-input:focus {
        border-color: var(--vscode-focusBorder, #007acc);
    }

    .binary-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
    }

    .toolbar-button {
        background: var(--vscode-button-secondaryBackground, #3a3d41);
        border: 1px solid var(--vscode-button-border, #555);
        color: var(--vscode-button-secondaryForeground, #fff);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
        font-family: var(--vscode-font-family);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s;
    }

    .toolbar-button:hover {
        background: var(--vscode-button-secondaryHoverBackground, #4b4f55);
        border-color: var(--vscode-focusBorder, #007acc);
    }

    .binary-table {
        overflow-x: auto;
        border: 1px solid var(--vscode-panel-border, #2b2f33);
        border-radius: 4px;
        background: var(--vscode-terminal-background, #111315);
        padding: 6px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .binary-header, .binary-row {
        display: grid;
        grid-template-columns: 168px repeat(var(--binary-byte-count, 64), 24px);
        align-items: center;
        gap: 1px;
        width: max-content;
        min-width: 100%;
    }

    .binary-header {
        margin-bottom: 3px;
        color: var(--vscode-descriptionForeground, #999);
        font-size: 9px;
        font-weight: 700;
        border-bottom: 1px solid var(--vscode-panel-border, #2b2f33);
        padding-bottom: 3px;
    }

    .binary-row {
        min-height: 21px;
        border-radius: 2px;
        cursor: pointer;
    }

    .binary-row:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .binary-row.selected {
        background: transparent;
    }

    .binary-row.selected .binary-row-label {
        background: rgba(86, 156, 214, 0.18);
        border-radius: 3px;
    }

    .binary-row-label-header {
        width: 168px;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.6;
        padding-left: 6px;
    }

    .binary-row-label {
        width: 168px;
        min-height: 20px;
        display: flex;
        align-items: center;
        gap: 5px;
        padding-right: 6px;
        padding-left: 2px;
    }

    .row-number {
        width: 28px;
        flex: 0 0 28px;
        text-align: right;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 10px;
        opacity: 0.55;
    }

    .row-name-input {
        width: 128px;
        min-height: 20px;
        background: transparent;
        color: var(--vscode-input-foreground);
        border: 1px solid transparent;
        border-radius: 2px;
        padding: 1px 5px;
        font-size: 10px;
        font-family: var(--vscode-font-family);
        outline: none;
    }

    .row-name-input:focus {
        border-color: var(--vscode-focusBorder, #007acc);
        background: var(--vscode-input-background);
    }

    .byte-cell {
        width: 24px;
        height: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 2px;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 10px;
        line-height: 1;
        user-select: none;
        color: var(--vscode-editor-foreground);
        position: relative;
    }

    .byte-cell.group-start {
        margin-left: 0;
        box-shadow: none;
    }

    .byte-cell.match {
        background: transparent;
        color: #ffffff;
    }

    .byte-cell.diff {
        background: #7f1d1d;
        color: #ffffff;
        font-weight: 700;
    }

    .byte-cell.missing {
        background: #7a5a12;
        color: #ffffff;
    }

    .byte-cell.mark-blue {
        background: #1f5f8b;
        color: #ffffff;
    }

    .byte-cell.mark-violet {
        background: #6b4aa5;
        color: #ffffff;
    }

    .byte-cell.mark-cyan {
        background: #1b6f6f;
        color: #ffffff;
    }

    .binary-empty {
        padding: 12px;
        text-align: center;
        font-size: 11px;
        opacity: 0.45;
    }

    @media (max-width: 520px) {
        .binary-input-panel {
            grid-template-columns: 1fr;
        }
    }
`;

/* Help */
const helpStyles = `
    /* Title bar with help button */
    .title-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

    .title-bar h1 {
        margin-bottom: 0;
    }

    .help-btn {
        background: var(--vscode-button-secondaryBackground, #3c3c3c);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        font-size: 16px;
        font-weight: 700;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .help-btn:hover {
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #fff);
        border-color: var(--vscode-focusBorder, #007acc);
    }

    /* Help Modal */
    .help-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .help-modal-content {
        background: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        width: 90%;
        max-width: 700px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .help-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
    }

    .help-modal-header h2 {
        font-size: 18px;
        margin: 0;
    }

    .help-modal-close {
        background: transparent;
        border: none;
        font-size: 24px;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        padding: 0 8px;
        transition: color 0.15s;
    }

    .help-modal-close:hover {
        color: #f44747;
    }

    .help-modal-tabs {
        display: flex;
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
        padding: 0 16px;
        gap: 2px;
    }

    .help-tab {
        padding: 10px 16px;
        background: transparent;
        border: none;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s;
        border-bottom: 2px solid transparent;
    }

    .help-tab:hover {
        background: var(--vscode-list-hoverBackground, #2a2d2e);
    }

    .help-tab.active {
        color: var(--vscode-button-background, #0e639c);
        border-bottom-color: var(--vscode-button-background, #0e639c);
    }

    .help-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }

    .help-section {
        font-size: 13px;
        line-height: 1.5;
    }

    .help-section h3 {
        font-size: 16px;
        margin-bottom: 12px;
        color: var(--vscode-titleBar-activeForeground, #fff);
    }

    .help-section h4 {
        font-size: 13px;
        margin: 16px 0 8px 0;
        color: var(--vscode-terminal-ansiGreen, #4ec9b0);
    }

    .help-section p {
        margin-bottom: 12px;
        opacity: 0.85;
    }

    .help-section ul {
        margin: 8px 0 12px 20px;
    }

    .help-section li {
        margin: 4px 0;
    }

    .help-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0 12px 0;
        font-size: 12px;
    }

    .help-table th,
    .help-table td {
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        padding: 6px 10px;
        text-align: left;
        vertical-align: top;
    }

    .help-table th {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        font-weight: 600;
    }

    .help-section code {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: var(--vscode-editor-font-family, monospace);
        font-size: 11px;
    }

    .help-section kbd {
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 10px;
        font-family: monospace;
    }
`;

/* Kitten floating window */
const kittenStyles = `
    .kitten-floating {
        position: fixed;
        bottom: -18px;
        right: 16px;
        z-index: 999999;
        cursor: pointer;
        user-select: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        transition: transform 0.1s ease;
    }

    .kitten-floating:hover {
        transform: scale(1.02);
    }

    .kitten-floating:active {
        transform: scale(0.98);
    }

    .kitten-image {
        width: 120px;
        height: 120px;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
        border-radius: 0;
        background: transparent;
        border: none;
        padding: 0;
        transition: opacity 0.15s ease;
    }

    .kitten-meow {
        position: absolute;
        top: -20px;
        right: 0;
        font-size: 10px;
        background: var(--vscode-editor-inactiveSelectionBackground, #2a2d2e);
        padding: 2px 6px;
        border-radius: 12px;
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        color: var(--vscode-terminal-ansiGreen, #4ec9b0);
        animation: kittenMeowFade 0.5s ease-out;
        pointer-events: none;
        white-space: nowrap;
    }

    @keyframes kittenMeowFade {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-15px);
        }
    }

    @media (max-width: 400px) {
        .kitten-floating {
            bottom: 2px;
            right: 8px;
        }

        .kitten-image {
            width: 90px;
            height: 90px;
        }
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
        binaryDiffStyles,
        helpStyles,
        kittenStyles,
        historyStyles,
    ].join('\n');
}
