/**
 * webview/ascii/logic.ts
 * Client-side JS for ASCII mode.
 *
 * Sections:
 *   1. Detection  — isHexCodes / isDecCodes
 *   2. Parsing    — normalizeHexCodes / smartParseHex
 *   3. Decoding   — decodeHexToText / decodeDecToText
 *   4. Encoding   — encodeTextToCodes
 *   5. Rendering  — renderCharCards / copyCharCode
 *   6. convertAscii — main entry point
 */
export function getAsciiLogic(): string
{
    return `

/*
   1. DETECTION
*/

function isHexCodes(input)
{
    var trimmed = input.trim();
    if (trimmed === '') { return false; }

    var temp  = trimmed.replace(/0x/gi, ' 0x');
    var parts = temp.split(/\\s+/).filter(function(p) { return p.length > 0; });

    for (var i = 0; i < parts.length; i++) {
        var hex = parts[i].replace(/^0x/i, '');
        if (!/^[0-9a-fA-F]{1,2}$/.test(hex)) { return false; }
        if (parseInt(hex, 16) > 255)           { return false; }
    }

    return true;
}

function isDecCodes(input)
{
    var parts = input.trim().split(/\\s+/);
    if (parts.length === 0) { return false; }

    for (var i = 0; i < parts.length; i++) {
        if (/^0x/i.test(parts[i]))   { return false; }
        if (!/^\\d+$/.test(parts[i])) { return false; }
        var val = parseInt(parts[i], 10);
        if (isNaN(val) || val < 0 || val > 255) { return false; }
    }

    return true;
}

/*
   2. PARSING
*/

function normalizeHexCodes(input)
{
    var temp  = input.replace(/0x/gi, ' 0x');
    var parts = temp.split(/\\s+/).filter(function(p) { return p.length > 0; });

    return parts.map(function(p) {
        var hex = p.replace(/^0x/i, '');
        return (hex.length === 1 ? '0' + hex : hex).toUpperCase();
    });
}

function smartParseHex(input)
{
    var cleaned = input.replace(/0x/gi, '').replace(/\\s+/g, '');

    if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length % 2 === 0) {
        var bytes = [];
        for (var i = 0; i < cleaned.length; i += 2) {
            bytes.push(cleaned.substr(i, 2));
        }
        return bytes;
    }

    return normalizeHexCodes(input);
}

/*
   3. DECODING
*/

function charFromCode(code)
{
    if (code >= 32 && code <= 126) { return String.fromCharCode(code); }
    if (code === 10) { return '\\n'; }
    if (code === 13) { return '\\r'; }
    if (code === 9)  { return '\\t'; }
    return '●';
}

function decodeHexToText(input)
{
    var bytes  = smartParseHex(input);
    var text   = '';
    var codes  = [];

    for (var i = 0; i < bytes.length; i++) {
        var code = parseInt(bytes[i], 16);
        codes.push(code);
        text += charFromCode(code);
    }

    return { text: text, codes: codes, bytes: bytes };
}

function decodeDecToText(input)
{
    var parts = input.trim().split(/\\s+/);
    var text  = '';
    var codes = [];

    for (var i = 0; i < parts.length; i++) {
        var code = parseInt(parts[i], 10);
        codes.push(code);
        text += charFromCode(code);
    }

    return { text: text, codes: codes };
}

/*
   4. ENCODING
*/

function encodeTextToCodes(text)
{
    var hexParts       = [];
    var hexPrettyParts = [];
    var decParts       = [];
    var codes          = [];

    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        codes.push(code);
        var hexByte = code.toString(16).toUpperCase().padStart(2, '0');
        hexParts.push(hexByte);
        hexPrettyParts.push('0x' + hexByte);
        decParts.push(code.toString());
    }

    return {
        hex      : hexParts.join(' '),
        hexPretty: hexPrettyParts.join(' '),
        dec      : decParts.join(' '),
        codes    : codes,
    };
}

/*
   5. CHAR CARDS
*/

function renderCharCards(codes, containerId)
{
    var container = document.getElementById(containerId);

    if (!codes || codes.length === 0) {
        container.innerHTML = '';
        return;
    }

    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">';

    for (var i = 0; i < codes.length; i++) {
        var code = codes[i];
        var char = (code >= 32 && code <= 126) ? String.fromCharCode(code) : '●';
        var display = char === ' '  ? '[space]'
                    : char === '\\n' ? '[LF]'
                    : char === '\\r' ? '[CR]'
                    : char === '\\t' ? '[TAB]'
                    : char;

        html += '<div class="ascii-char-card" onclick="copyCharCode(' + code + ')">' +
            '<div class="ascii-char" title="' + (char === ' ' ? 'space' : char) + '">' + escHtml(display) + '</div>' +
            '<div class="ascii-code">' + code + '</div>' +
        '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

function copyCharCode(code)
{
    var char = (code >= 32 && code <= 126) ? String.fromCharCode(code) : '';
    navigator.clipboard.writeText(char);

    var cards = document.querySelectorAll('.ascii-char-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.opacity = '0.7';
        setTimeout(function(card) { card.style.opacity = ''; }, 200, cards[i]);
    }
}

/*
   6. CONVERT ASCII
*/

function resetAsciiResults()
{
    document.getElementById('asciiTextVal').textContent  = '—';
    document.getElementById('asciiHexVal').textContent   = '—';
    document.getElementById('asciiDecVal').textContent   = '—';
    document.getElementById('asciiHexChars').innerHTML   = '';
    document.getElementById('asciiDecChars').innerHTML   = '';
    document.getElementById('asciiDirection').textContent = '';
    document.getElementById('sectionAsciiInfo').style.display = 'none';
}

function convertAscii()
{
    var rawInput = document.getElementById('asciiInput').value;
    var errorMsg = document.getElementById('asciiErrorMsg');

    if (!rawInput.trim()) {
        errorMsg.textContent = '';
        resetAsciiResults();
        return;
    }

    try {
        var textResult = '';
        var hexResult  = '';
        var decResult  = '';
        var codes      = [];
        var direction  = '';

        var inputIsHex = isHexCodes(rawInput);
        var inputIsDec = !inputIsHex && isDecCodes(rawInput);

        if (inputIsHex) {
            direction = '[HEX] codes → text';
            var decoded  = decodeHexToText(rawInput);
            textResult   = decoded.text;
            hexResult    = decoded.bytes.map(function(b) { return '0x' + b; }).join(' ');
            decResult    = decoded.codes.join(' ');
            codes        = decoded.codes;
        }
        else if (inputIsDec) {
            direction = '[DEC] codes → text';
            var decodedDec = decodeDecToText(rawInput);
            textResult     = decodedDec.text;
            hexResult      = decodedDec.codes.map(function(c) {
                return '0x' + c.toString(16).toUpperCase().padStart(2, '0');
            }).join(' ');
            decResult = rawInput.trim();
            codes     = decodedDec.codes;
        }
        else {
            direction = '[TEXT] → codes';
            var encoded = encodeTextToCodes(rawInput);
            textResult  = rawInput;
            hexResult   = encoded.hexPretty;
            decResult   = encoded.dec;
            codes       = encoded.codes;
        }

        errorMsg.textContent = '';

        document.getElementById('asciiTextVal').textContent  = textResult;
        document.getElementById('asciiHexVal').textContent   = hexResult;
        document.getElementById('asciiDecVal').textContent   = decResult;
        document.getElementById('asciiDirection').textContent = direction;

        renderCharCards(codes, 'asciiHexChars');
        renderCharCards(codes, 'asciiDecChars');
        document.getElementById('sectionAsciiInfo').style.display = 'block';

        if (_autoSave && rawInput !== _asciiLastPushed) {
            if (_asciiPushTimer) { clearTimeout(_asciiPushTimer); }
            _asciiPushTimer = setTimeout(function() {
                _asciiLastPushed = rawInput;
                addToHistory(rawInput, textResult, 'ascii');
            }, 800);
        }

    } catch (e) {
        errorMsg.textContent = 'Invalid input: ' + e.message;
        resetAsciiResults();
    }
}

    `;
}