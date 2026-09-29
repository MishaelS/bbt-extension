/**
 * webview/number/logic.ts
 * Client-side JS for Number mode.
 *
 * Sections:
 *   1. safeEval      - validated scalar and comma-separated expression evaluation
 *   2. renderTypes   - int8 through int64 signed/unsigned fit grid
 *   3. renderBitGrid - visual bit cells with index labels
 *   4. renderEndian  - Big / Little Endian byte layout
 *   5. convertNumber - main entry point, wires everything together
 */
export function getNumberLogic(): string
{
    return `

/*
   1. SAFE EVAL
*/

function safeEval(expr)
{
    var parts = splitNumberExpressions(expr);
    if (parts.length !== 1) {
        throw new Error('Expected one expression');
    }
    return evaluateNumberExpression(parts[0]);
}

function splitNumberExpressions(input)
{
    if (typeof input !== 'string' || !input.trim() || input.length > 10000) {
        throw new Error('Invalid characters');
    }

    var parts = [];
    var start = 0;
    var depth = 0;

    for (var i = 0; i < input.length; i++) {
        var char = input[i];
        if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
            if (depth < 0) { throw new Error('Unbalanced parentheses'); }
        } else if (char === ',') {
            if (depth !== 0) { throw new Error('Commas are only allowed between expressions'); }
            var part = input.slice(start, i).trim();
            if (!part) { throw new Error('Empty expression'); }
            parts.push(part);
            start = i + 1;
        }
    }

    if (depth !== 0) { throw new Error('Unbalanced parentheses'); }

    var last = input.slice(start).trim();
    if (!last) { throw new Error('Empty expression'); }
    parts.push(last);

    if (parts.length > 50) { throw new Error('Too many expressions'); }
    return parts;
}

function normalizeShortLiterals(expr)
{
    var processed = expr.replace(/\\s/g, '');
    processed = processed.replace(/(^|[^a-fA-F0-9])x([0-9a-fA-F]+)/gi, function(match, prefix, hex) {
        return prefix + '0x' + hex;
    });
    processed = processed.replace(/(^|[^a-zA-Z0-9])b([01]+)/gi, function(match, prefix, bin) {
        return prefix + '0b' + bin;
    });
    processed = processed.replace(/^\\+|\\(\\+/g, function(match) {
        return match === '(+' ? '(' : '';
    });
    return processed;
}

function validateNumberExpression(processed)
{
    var withoutLiterals = processed
        .replace(/0x[0-9a-fA-F]+/gi, '0')
        .replace(/0b[01]+/gi, '0')
        .replace(/\\b(?:true|false)\\b/gi, '0');

    if (!/^[\\d\\+\\-\\*\\/\\%\\&\\|\\^\\~\\!\\=\\<\\>\\(\\)\\.]+$/.test(withoutLiterals)) {
        throw new Error('Invalid characters');
    }
}

function shouldUseBigInt(processed)
{
    return processed.indexOf('.') === -1 &&
        processed.indexOf('/') === -1 &&
        processed.indexOf('>>>') === -1;
}

function addBigIntSuffixes(processed)
{
    return processed.replace(/0x[0-9a-fA-F]+|0b[01]+|\\d+/gi, function(literal) {
        if (/^0[xb]/i.test(literal)) { return literal + 'n'; }
        return BigInt(literal).toString() + 'n';
    });
}

function normalizeEvalResult(result)
{
    if (typeof result === 'bigint') {
        if (result >= BigInt(Number.MIN_SAFE_INTEGER) && result <= BigInt(Number.MAX_SAFE_INTEGER)) {
            return Number(result);
        }
        return result;
    }

    if (typeof result === 'boolean') { return result; }

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
    }

    return result;
}

function evaluateNumberExpression(expr)
{
    var processed = normalizeShortLiterals(expr);
    validateNumberExpression(processed);
    processed = processed
        .replace(/\\btrue\\b/gi, 'true')
        .replace(/\\bfalse\\b/gi, 'false');
    var booleanCandidate = processed.replace(/>>>|<<|>>/g, '');
    var isBooleanExpression = /&&|\\|\\||[<>=!]/.test(booleanCandidate);

    if (shouldUseBigInt(processed)) {
        processed = addBigIntSuffixes(processed);
    } else {
        processed = processed.replace(/0x[0-9a-fA-F]+/gi, function(m) {
            return Number(m).toString();
        });
        processed = processed.replace(/0b[01]+/gi, function(m) {
            return Number(m).toString();
        });
    }

    var result = new Function('return (' + processed + ')')();
    if (isBooleanExpression) { result = Boolean(result); }
    return normalizeEvalResult(result);
}

function safeEvalMany(expr)
{
    return splitNumberExpressions(expr).map(function(part) {
        return evaluateNumberExpression(part);
    });
}

function isIntegerResult(value)
{
    return typeof value === 'bigint' ||
        (typeof value === 'number' && Number.isInteger(value));
}

function isExactIntegerResult(value)
{
    return typeof value === 'bigint' ||
        (typeof value === 'number' && Number.isSafeInteger(value));
}

function toBigIntValue(value)
{
    if (typeof value === 'bigint') { return value; }
    if (typeof value === 'number' && Number.isSafeInteger(value)) { return BigInt(value); }
    throw new Error('Integer is outside the exact Number range');
}

function absBigInt(value)
{
    return value < 0n ? -value : value;
}

function formatNumberResult(value, radix)
{
    if (typeof value === 'boolean') { return value ? 'true' : 'false'; }
    if (!isIntegerResult(value)) {
        return radix === 10 ? value.toString(10) : '- (float only)';
    }
    if (!isExactIntegerResult(value)) {
        return radix === 10 ? value.toString(10) : '- (unsafe integer)';
    }

    var integer = toBigIntValue(value);
    var negative = integer < 0n;
    var absolute = absBigInt(integer);
    var prefix = radix === 16 ? '0x' : radix === 2 ? '0b' : '';
    var digits = absolute.toString(radix);
    if (radix === 16) { digits = digits.toUpperCase(); }
    return (negative ? '-' : '') + prefix + digits;
}

/*
   1.5. INPUT HANDLER WITH AUTO-COMPLETE
*/

function handleNumberInputKeydown(event)
{
    var input = event.target;
    var start = input.selectionStart;
    var end = input.selectionEnd;
    var value = input.value;

    // Auto-complete parentheses: when user types '('
    if (event.key === '(') {
        event.preventDefault();
        var newValue = value.slice(0, start) + '()' + value.slice(end);
        input.value = newValue;
        input.setSelectionRange(start + 1, start + 1);
        return;
    }

    // Auto-skip closing parenthesis: if user types ')' and next char is ')', skip it
    if (event.key === ')') {
        if (start < value.length && value[start] === ')') {
            event.preventDefault();
            input.setSelectionRange(start + 1, start + 1);
            return;
        }
        return;
    }

}

/*
   2. INTEGER TYPE GRID
*/

var INT_TYPES = [
    { name: 'int8',   min: -128n,        max: 127n,        signed: true  },
    { name: 'uint8',  min: 0n,           max: 255n,        signed: false },
    { name: 'int16',  min: -32768n,      max: 32767n,      signed: true  },
    { name: 'uint16', min: 0n,           max: 65535n,      signed: false },
    { name: 'int32',  min: -2147483648n, max: 2147483647n, signed: true  },
    { name: 'uint32', min: 0n,           max: 4294967295n, signed: false },
    { name: 'int64',  min: -(1n << 63n), max: (1n << 63n) - 1n, signed: true },
    { name: 'uint64', min: 0n,           max: (1n << 64n) - 1n, signed: false },
];

function renderTypes(value)
{
    if (!isIntegerResult(value)) {
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

    var integer = toBigIntValue(value);
    var fittingTypes = INT_TYPES.filter(function(t) {
        return integer >= t.min && integer <= t.max;
    });
    var smallestFit = fittingTypes[0] || null;

    var html = INT_TYPES.map(function(t) {
        var fits  = integer >= t.min && integer <= t.max;
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
    var abs    = absBigInt(toBigIntValue(value));
    var binRaw = abs.toString(2);
    var wrap = document.getElementById('bitGrid');

    if (binRaw.length > 256) {
        wrap.innerHTML = '<div class="detail-limit">Bit visualization is limited to 256 bits (' +
            binRaw.length + ' bits in this result).</div>';
        document.getElementById('sectionBits').style.display = '';
        return;
    }

    var width  = Math.max(8, Math.ceil(binRaw.length / 8) * 8);
    var bits   = binRaw.padStart(width, '0').split('').map(Number);

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
    var abs = absBigInt(toBigIntValue(value));
    var hex = abs.toString(16).toUpperCase();
    if (hex.length % 2) { hex = '0' + hex; }

    if (hex.length > 64) {
        document.getElementById('endianWrap').innerHTML =
            '<div class="detail-limit">Endianness visualization is limited to 256 bits (' +
            (hex.length * 4) + ' bits in this result).</div>';
        document.getElementById('sectionEndian').style.display = '';
        return;
    }

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
    setOutputValues('-', '-', '-');
    document.getElementById('decLabel').textContent = 'DEC';
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
        var results = safeEvalMany(raw);
        var isMultiple = results.length > 1;
        var allBooleans = results.every(function(value) {
            return typeof value === 'boolean';
        });

        var decValues = results.map(function(value) {
            return formatNumberResult(value, 10);
        });
        var hexValues = results.map(function(value) {
            return typeof value === 'boolean' ? '- (boolean)' : formatNumberResult(value, 16);
        });
        var binValues = results.map(function(value) {
            return typeof value === 'boolean' ? '- (boolean)' : formatNumberResult(value, 2);
        });
        var dec = decValues.join(', ');

        input.classList.remove('error');
        errorMsg.textContent = '';
        document.getElementById('decLabel').textContent =
            allBooleans ? 'BOOL' : isMultiple ? 'RESULT' : 'DEC';
        setOutputValues(dec, hexValues.join(', '), binValues.join(', '));

        if (!isMultiple && isExactIntegerResult(results[0])) {
            var result = results[0];
            var binRaw = absBigInt(toBigIntValue(result)).toString(2);
            if (binRaw.length <= 256) {
                var padLen = Math.ceil(binRaw.length / 8) * 8;
                var padded = binRaw.padStart(padLen, '0');
                var groups = padded.match(/.{1,8}/g) || [];
                document.getElementById('binGroups').innerHTML = groups
                    .map(function(b) { return '<span class="bin-byte">' + b + '</span>'; })
                    .join('');
            } else {
                document.getElementById('binGroups').innerHTML =
                    '<span class="detail-limit">Byte grouping is limited to 256 bits.</span>';
            }

            renderTypes(result);
            renderBitGrid(result);
            renderEndian(result);
        } else {
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
