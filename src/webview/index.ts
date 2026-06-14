/**
 * webview/index.ts
 * Assembles the complete HTML document for the BBT webview panel.
 *
 * Imports:
 *   getAllStyles()   <- styles.ts        (all CSS)
 *   getMarkup()      <- html.ts          (markup)
 *   getNumberLogic() <- number/logic.ts  (number mode JS)
 *   getAsciiLogic()  <- ascii/logic.ts   (ASCII mode JS)
 *   getDiffLogic()   <- diff/logic.ts    (Binary Diff mode JS)
 *   getHelpLogic()   <- help/logic.ts    (help info)
 *   getSharedLogic() <- shared/logic.ts  (history, mode switch, utilities)
 */
import { getAsciiLogic } from './ascii/logic';
import { getDiffLogic } from './diff/logic';
import { getHelpLogic } from './help/logic';
import { getMarkup } from './html';
import { getNumberLogic } from './number/logic';
import { getSharedLogic } from './shared/logic';
import { getAllStyles } from './styles';

export function buildWebviewDocument(): string {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Byte Bit Tool</title>
        <style>${getAllStyles()}</style>
    </head>
    <body>
        ${getMarkup()}
        <script>
            ${getNumberLogic()}
            ${getAsciiLogic()}
            ${getDiffLogic()}
            ${getHelpLogic()}
            ${getSharedLogic()}
        </script>
    </body>
</html>
`;
}