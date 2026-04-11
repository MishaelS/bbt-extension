/**
 * hover.ts
 * Hover provider for BBT.
 *
 * Detects numeric literals under the cursor (DEC / HEX / BIN),
 * and renders a coloured MarkdownString (HTML mode) with conversions.
 */
import * as vscode from 'vscode';

/* Colour palette (One Dark — readable on dark & light themes) */
const C = {
    label : '#E5C07B',  // yellow  — DEC / HEX / BIN labels
    prefix: '#E06C75',  // red     — 0x  0b
    number: '#C678DD',  // purple  — digits
    dim   : '#636D83',  // grey    — separators, "detected:"
};

/* Types */
interface ParseResult {
    value       : number;
    detectedBase: 'dec' | 'hex' | 'bin';
}

/* Helpers */
function parseNumber(word: string): ParseResult | null {
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

/** Pad to whole bytes and return digits only (no prefix). */
function hexDigits(value: number): string {
    const raw    = Math.abs(value).toString(16).toUpperCase();
    const padLen = Math.ceil(raw.length / 2) * 2;
    return raw.padStart(padLen, '0');
}

/** Pad to whole bytes and return digits only (no prefix), grouped by byte. */
function binDigits(value: number): string {
    const raw    = Math.abs(value).toString(2);
    const padLen = Math.ceil(raw.length / 8) * 8;
    const padded = raw.padStart(padLen, '0');
    return (padded.match(/.{1,8}/g) || []).join(' ');
}

/** Wrap text in a coloured inline <span>. */
function span(color: string, text: string): string {
    return `<span style="color:${color}">${text}</span>`;
}

/**
 * One result row:   LABEL   [prefix]digits
 * prefix is coloured red, digits purple, label yellow.
 */
function row(label: string, prefix: string, digits: string, sign = ''): string {
    const labelHtml  = span(C.label,  label.padEnd(4));
    const signHtml   = sign   ? span(C.dim,    sign)   : '';
    const prefixHtml = prefix ? span(C.prefix, prefix) : '';
    const digitsHtml = span(C.number, digits);
    return `<div style="font-family:monospace;line-height:1.9">${labelHtml} ${signHtml}${prefixHtml}${digitsHtml}</div>`;
}

/* Main builder */
function buildHover(
    value      : number,
    detectedBase: 'dec' | 'hex' | 'bin',
    original   : string
): vscode.MarkdownString {

    const sign = value < 0 ? '-' : '';
    const labelMap: Record<string, string> = { dec: 'DEC', hex: 'HEX', bin: 'BIN' };

    // Title
    const title =
        `<div style="margin-bottom:6px;font-size:12px">` +
        `${span(C.dim, 'BBT')} &nbsp;` +
        `${span(C.dim, 'detected:')} ` +
        `${span(C.label, labelMap[detectedBase])} ` +
        `${span(C.dim, '→')} ` +
        `${span(C.number, original)}` +
        `</div>` +
        `<div style="border-top:1px solid #3E4451;margin-bottom:6px"></div>`;

    // Result rows — omit the detected base
    let rows = '';
    if (detectedBase !== 'dec') {
        rows += row('DEC', '', value.toString(10));
    }
    if (detectedBase !== 'hex') {
        rows += row('HEX', '0x', hexDigits(value), sign);
    }
    if (detectedBase !== 'bin') {
        rows += row('BIN', '0b', binDigits(value), sign);
    }

    const md = new vscode.MarkdownString(title + rows);
    md.isTrusted   = true;
    md.supportHtml = true;
    return md;
}

/* Export */

/**
 * Returns a registered HoverProvider disposable.
 * Call context.subscriptions.push(createHoverProvider()) in activate().
 */
export function createHoverProvider(): vscode.Disposable {
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
                const result = parseNumber(word);
                if (!result)  { return undefined; }

                return new vscode.Hover(
                    buildHover(result.value, result.detectedBase, word),
                    range
                );
            }
        }
    );
}