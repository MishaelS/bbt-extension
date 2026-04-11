/**
 * webview/index.ts
 * Assembles the complete HTML document for the BBT webview panel.
 *
 * Imports:
 *   getAllStyles()  ← styles.ts   (all CSS)
 *   getHTML()       ← html.ts     (markup)
 *   getLogic()      ← logic.ts    (client-side JS)
 */
import { getAllStyles } from './styles';
import { getHTML }      from './html';
import { getLogic }     from './logic';

export function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Byte Bit Tool</title>
    <style>${getAllStyles()}</style>
</head>
<body>
    ${getHTML()}
    <script>${getLogic()}</script>
</body>
</html>`;
}