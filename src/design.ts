export function getStyles(): string {
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 16px;  /* Reduced padding for sidebar */
            min-height: 100vh;
        }

        /* Adaptation for sidebar - reduce padding */
        @media (max-width: 400px) {
            body {
                padding: 12px;
            }
            
            .result-card {
                padding: 12px;
                gap: 8px;
            }
            
            .result-value {
                font-size: 13px;
            }
        }

        h1 {
            font-size: 18px;  /* Slightly less for sidebar */
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
            padding: 6px 10px;  /* Slightly less for sidebar */
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

        .result-label.dec { color: #4ec9b0; }
        .result-label.hex { color: #569cd6; }
        .result-label.bin { color: #ce9178; }

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
}