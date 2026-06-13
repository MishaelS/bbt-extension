/**
 * webview/number/logic.ts
 * Client-side JS for Number mode.
 *
 * Sections:
 *   1. safeEval     — expression evaluator (DEC / HEX / BIN literals + operators)
 *   2. renderTypes  — int8 / uint8 / int16 / uint16 / int32 / uint32 fit grid
 *   3. renderBitGrid — visual bit cells with index labels
 *   4. renderEndian  — Big / Little Endian byte layout
 *   5. convertNumber — main entry point, wires everything together
 */
export function getNumberLogic(): string
{
    return `

/*
   1. SAFE EVAL
*/

function safeEval(expr)
{
    var processed = expr;

    // Remove spaces from the expression first
    processed = processed.replace(/\\s/g, '');

    // Support for standard hex literals (0xFF)
    processed = processed.replace(/0x[0-9a-fA-F]+/gi, function(m) {
        return parseInt(m, 16).toString();
    });

    // Support for short hex literals (xFF or xFF) - no 0 prefix
    processed = processed.replace(/(?:^|[^a-fA-F0-9])x([0-9a-fA-F]+)/gi, function(match, hex) {
        // Make sure we don't replace things like "textx123"
        if (match.match(/[a-zA-Z0-9]x/)) return match;
        return parseInt(hex, 16).toString();
    });

    // Support for standard binary literals (0b1010)
    processed = processed.replace(/0b[01]+/gi, function(m) {
        return parseInt(m.slice(2), 2).toString();
    });

    // Support for short binary literals (b1010 or b1010) - no 0 prefix
    processed = processed.replace(/(?:^|[^01])b([01]+)/gi, function(match, bin) {
        // Make sure we don't replace things like "ab1010"
        if (match.match(/[a-zA-Z0-9]b/)) return match;
        return parseInt(bin, 2).toString();
    });

    // Add dot to allowed characters for float support
    if (!/^[\\d\\s\\+\\-\\*\\/\\%\\&\\|\\^\\~\\<\\>\\(\\)\\.]+$/.test(processed)) {
        throw new Error('Invalid characters');
    }

    var result = new Function('return (' + processed + ')')();

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
    }

    // Return float without truncation
    return result;
}

/*
   2. INTEGER TYPE GRID
*/

var INT_TYPES = [
    { name: 'int8',   min: -128,        max: 127,        signed: true  },
    { name: 'uint8',  min: 0,           max: 255,         signed: false },
    { name: 'int16',  min: -32768,      max: 32767,       signed: true  },
    { name: 'uint16', min: 0,           max: 65535,       signed: false },
    { name: 'int32',  min: -2147483648, max: 2147483647,  signed: true  },
    { name: 'uint32', min: 0,           max: 4294967295,  signed: false },
];

function renderTypes(value)
{
    // Check if the number is an integer
    if (Math.floor(value) !== value) {
        var typeGrid = document.getElementById('typeGrid');
        if (typeGrid) {
            typeGrid.innerHTML = '<div class="type-card" style="grid-column:1/-1;text-align:center">' +
                '<div class="type-value">💡 Floating point value</div>' +
                '<div style="font-size:10px;opacity:0.7;margin-top:4px">Integer types only apply to whole numbers</div>' +
                '</div>';
            document.getElementById('sectionTypes').style.display = '';
        }
        return;
    }

    var fittingTypes = INT_TYPES.filter(function(t) {
        return value >= t.min && value <= t.max;
    });
    var smallestFit = fittingTypes[0] || null;

    var html = INT_TYPES.map(function(t) {
        var fits  = value >= t.min && value <= t.max;
        var exact = fits && t === smallestFit;
        var cls   = 'type-card' + (fits ? '' : ' overflow') + (exact ? ' exact' : '');

        return '<div class="' + cls + '">' +
            '<div class="type-name">' + t.name + '</div>' +
            '<div class="type-value">' + (fits ? 'fits' : 'overflow') + '</div>' +
        '</div>';
    }).join('');

    document.getElementById('typeGrid').innerHTML = html;
    document.getElementById('sectionTypes').style.display = '';
}

/*
   3. BIT GRID
*/

function renderBitGrid(value)
{
    var abs    = Math.abs(value);
    var binRaw = abs.toString(2);
    var width  = binRaw.length <= 8 ? 8 : binRaw.length <= 16 ? 16 : 32;
    var bits   = binRaw.padStart(width, '0').split('').map(Number);

    var wrap = document.getElementById('bitGrid');
    wrap.innerHTML = '';

    /* Index labels row */
    var idxRow = document.createElement('div');
    idxRow.className = 'bit-index-row';

    for (var i = 0; i < width; i++) {
        if (i > 0 && i % 4 === 0) {
            var gap = document.createElement('div');
            gap.className = 'bit-index sep';
            idxRow.appendChild(gap);
        }
        var idx = document.createElement('div');
        idx.className   = 'bit-index';
        idx.textContent = (width - 1 - i).toString();
        idxRow.appendChild(idx);
    }

    wrap.appendChild(idxRow);

    /* Bit cells row */
    var bitRow = document.createElement('div');
    bitRow.className = 'bit-row';

    for (var j = 0; j < width; j++) {
        if (j > 0 && j % 4 === 0) {
            var sep = document.createElement('div');
            sep.className = 'bit-cell sep';
            bitRow.appendChild(sep);
        }
        var cell = document.createElement('div');
        cell.className   = 'bit-cell' + (bits[j] ? ' on' : '');
        cell.textContent = bits[j].toString();
        bitRow.appendChild(cell);
    }

    wrap.appendChild(bitRow);

    document.getElementById('sectionBits').style.display = '';
}

/*
   4. ENDIANNESS
*/

function renderEndian(value)
{
    var abs = Math.abs(value);
    var hex = abs.toString(16).toUpperCase();
    if (hex.length % 2) { hex = '0' + hex; }

    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
        bytes.push(hex.slice(i, i + 2));
    }

    if (bytes.length < 2) {
        document.getElementById('sectionEndian').style.display = 'none';
        return;
    }

    function byteSpans(arr) {
        return arr.map(function(b, i) {
            var cls = i === 0 ? 'endian-byte highlight' : 'endian-byte';
            return '<span class="' + cls + '">0x' + b + '</span>';
        }).join('');
    }

    document.getElementById('endianWrap').innerHTML =
        '<div class="endian-row">' +
            '<span class="endian-label">Big</span>' +
            '<div class="endian-bytes">' + byteSpans(bytes.slice()) + '</div>' +
        '</div>' +
        '<div class="endian-row">' +
            '<span class="endian-label">Little</span>' +
            '<div class="endian-bytes">' + byteSpans(bytes.slice().reverse()) + '</div>' +
        '</div>';

    document.getElementById('sectionEndian').style.display = '';
}

/*
   5. CONVERT NUMBER
*/

function resetNumberResults()
{
    setOutputValues('—', '—', '—');
    document.getElementById('binGroups').innerHTML = '';
    document.getElementById('sectionTypes').style.display  = 'none';
    document.getElementById('sectionBits').style.display   = 'none';
    document.getElementById('sectionEndian').style.display = 'none';
}

function setOutputValues(d, h, b)
{
    document.getElementById('decVal').textContent = d;
    document.getElementById('hexVal').textContent = h;
    document.getElementById('binVal').textContent = b;
}

function convertNumber(pushToHistory)
{
    if (pushToHistory === undefined) { pushToHistory = true; }

    var input    = document.getElementById('numInput');
    var errorMsg = document.getElementById('numErrorMsg');
    var raw      = input.value.trim();

    if (!raw) {
        input.classList.remove('error');
        errorMsg.textContent = '';
        resetNumberResults();
        return;
    }

    try {
        var result = safeEval(raw);
        var dec = result.toString(10);

        input.classList.remove('error');
        errorMsg.textContent = '';

        // Check if result is integer
        var isInteger = Math.floor(result) === result;

        if (isInteger) {
            // Integer path - show everything
            var isNeg  = result < 0;
            var abs    = Math.abs(result);
            var binRaw = abs.toString(2);
            var hex = (isNeg ? '-' : '') + '0x' + abs.toString(16).toUpperCase();
            var bin = (isNeg ? '-' : '') + '0b'+ binRaw;

            setOutputValues(dec, hex, bin);

            var padLen = Math.ceil(binRaw.length / 8) * 8;
            var padded = binRaw.padStart(padLen, '0');
            var groups = padded.match(/.{1,8}/g) || [];
            document.getElementById('binGroups').innerHTML = groups
                .map(function(b) { return '<span class="bin-byte">' + b + '</span>'; })
                .join('');

            renderTypes(result);
            renderBitGrid(result);
            renderEndian(result);
        } else {
            // Float path - only show DEC
            setOutputValues(dec, '— (float only)', '— (float only)');
            document.getElementById('binGroups').innerHTML = '';
            document.getElementById('sectionTypes').style.display = 'none';
            document.getElementById('sectionBits').style.display = 'none';
            document.getElementById('sectionEndian').style.display = 'none';
        }

        if (pushToHistory && _autoSave) {
            if (_numPushTimer) { clearTimeout(_numPushTimer); }
            _numPushTimer = setTimeout(function() {
                if (raw !== _numLastPushed) {
                    _numLastPushed = raw;
                    addToHistory(raw, dec, 'number');
                }
            }, 800);
        }

    } catch (e) {
        input.classList.add('error');
        errorMsg.textContent = 'Invalid expression';
        resetNumberResults();
    }
}

    `;
}