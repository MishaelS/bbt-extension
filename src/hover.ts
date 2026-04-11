/**
 * hover.ts
 * Hover provider for BBT.
 *
 * Detects numeric literals under the cursor (DEC / HEX / BIN)
 * and renders a coloured MarkdownString (HTML mode) with base conversions.
 */
import * as vscode from 'vscode';

/* Colour palette (One Dark) */
const C = {
    label : '#E5C07B',   // yellow  — DEC / HEX / BIN labels
    prefix: '#E06C75',   // red     — 0x / 0b
    number: '#C678DD',   // purple  — digits
    dim   : '#636D83',   // grey    — separators, metadata
};

/* Types */
interface ParseResult
{
    value       : number;
    detectedBase: 'dec' | 'hex' | 'bin';
}

/* Parsing */
function parseNumericWord(word: string): ParseResult | null
{
    if (/^0x[0-9a-fA-F]+$/i.test(word)) {
        const value = parseInt(word.slice(2), 16);
        return isNaN(value) ? null : { value, detectedBase: 'hex' };
    }
    if (/^0b[01]+$/i.test(word)) {
        const value = parseInt(word.slice(2), 2);
        return isNaN(value) ? null : { value, detectedBase: 'bin' };
    }
    if (/^-?\d+$/.test(word)) {
        const value = parseInt(word, 10);
        return isNaN(value) ? null : { value, detectedBase: 'dec' };
    }
    return null;
}

/* Formatters */

/** Hex digits only (no prefix), padded to whole bytes. */
function toHexDigits(value: number): string
{
    const raw    = Math.abs(value).toString(16).toUpperCase();
    const padLen = Math.ceil(raw.length / 2) * 2;
    return raw.padStart(padLen, '0');
}

/** Binary digits only (no prefix), grouped by byte with spaces. */
function toBinDigits(value: number): string
{
    const raw    = Math.abs(value).toString(2);
    const padLen = Math.ceil(raw.length / 8) * 8;
    const padded = raw.padStart(padLen, '0');
    return (padded.match(/.{1,8}/g) || []).join(' ');
}

/* HTML helpers */
function span(color: string, text: string): string
{
    return `<span style="color:${color}">${text}</span>`;
}

function resultRow(label: string, prefix: string, digits: string, sign = ''): string
{
    const labelHtml  = span(C.label,  label.padEnd(4));
    const signHtml   = sign   ? span(C.dim,    sign)   : '';
    const prefixHtml = prefix ? span(C.prefix, prefix) : '';
    const digitsHtml = span(C.number, digits);
    return `<div style="font-family:monospace;line-height:1.9">${labelHtml} ${signHtml}${prefixHtml}${digitsHtml}</div>`;
}

/* Hover content builder */
function buildHoverContent(
    value       : number,
    detectedBase: 'dec' | 'hex' | 'bin',
    original    : string
): vscode.MarkdownString
{

    const sign     = value < 0 ? '-' : '';
    const labelMap : Record<string, string> = { dec: 'DEC', hex: 'HEX', bin: 'BIN' };

    const header =
        `<div style="margin-bottom:6px;font-size:12px">` +
        `${span(C.dim, 'BBT')} &nbsp;` +
        `${span(C.dim, 'detected:')} ` +
        `${span(C.label, labelMap[detectedBase])} ` +
        `${span(C.dim, '→')} ` +
        `${span(C.number, original)}` +
        `</div>` +
        `<div style="border-top:1px solid #3E4451;margin-bottom:6px"></div>`;

    let rows = '';
    if (detectedBase !== 'dec') { rows += resultRow('DEC', '',   value.toString(10)); }
    if (detectedBase !== 'hex') { rows += resultRow('HEX', '0x', toHexDigits(value), sign); }
    if (detectedBase !== 'bin') { rows += resultRow('BIN', '0b', toBinDigits(value), sign); }

    const md        = new vscode.MarkdownString(header + rows);
    md.isTrusted    = true;
    md.supportHtml  = true;
    return md;
}

/* Export */

/**
 * Returns a registered HoverProvider disposable.
 * Call context.subscriptions.push(createHoverProvider()) in activate().
 */
export function createHoverProvider(): vscode.Disposable
{
    return vscode.languages.registerHoverProvider(
        { scheme: 'file' },
        {
            provideHover(document, position) {
                const range = document.getWordRangeAtPosition(
                    position,
                    /0x[0-9a-fA-F]+|0b[01]+|-?\d+/
                );
                if (!range) { return undefined; }

                const word   = document.getText(range);
                const parsed = parseNumericWord(word);
                if (!parsed)  { return undefined; }

                return new vscode.Hover(
                    buildHoverContent(parsed.value, parsed.detectedBase, word),
                    range
                );
            }
        }
    );
}