/**
 * logic.ts
 * All client-side JavaScript that runs inside the BBT webview.
 *
 * Sections:
 *   1. safeEval      — expression parser / evaluator
 *   2. History       — last-20 calculations with debounced push
 *   3. Type info     — int8/uint8/int16/uint16/int32/uint32 fit check
 *   4. Bit grid      — visual bit cells with index labels
 *   5. Endianness    — Big / Little Endian byte layout
 *   6. convert()     — main entry point, wires everything together
 *   7. Utilities     — setAll(), copyVal(), escHtml()
 */
export function getLogic(): string {
    return `

/*
   1. SAFE EVAL
   Converts 0x / 0b literals to decimal, validates the expression,
   then evaluates it with new Function() (no eval).
*/

function safeEval(expr) {
    var processed = expr;

    processed = processed.replace(/0x[0-9a-fA-F]+/gi, function(m) {
        return parseInt(m, 16).toString();
    });

    processed = processed.replace(/0b[01]+/gi, function(m) {
        return parseInt(m.slice(2), 2).toString();
    });

    if (!/^[\\d\\s\\+\\-\\*\\/\\%\\&\\|\\^\\~\\<\\>\\(\\)]+$/.test(processed)) {
        throw new Error('Invalid characters');
    }

    var result = new Function('return (' + processed + ')')();

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
    }

    return Math.trunc(result);
}

/*
   2. HISTORY
   Stores up to 20 expressions. Push is debounced (800 ms) so fast
   typing doesn't flood the list. Clicking an item reloads the expression.
*/

var _history    = [];
var _pushTimer  = null;
var _lastPushed = null;

function addHistory(expr, decResult) {
    if (_history.length && _history[0].expr === expr) { return; }
    _history.unshift({ expr: expr, result: decResult });
    if (_history.length > 20) { _history.pop(); }
    renderHistory();
}

function clearHistory() {
    _history   = [];
    _lastPushed = null;
    renderHistory();
}

function renderHistory() {
    var el = document.getElementById('historyList');
    if (!_history.length) {
        el.innerHTML = '<div class="history-empty">No calculations yet</div>';
        return;
    }
    el.innerHTML = _history.map(function(h, i) {
        return '<div class="history-item" onclick="loadHistory(' + i + ')">' +
            '<span class="history-expr">' + escHtml(h.expr) + '</span>' +
            '<span class="history-result">= ' + h.result + '</span>' +
        '</div>';
    }).join('');
}

function loadHistory(i) {
    document.getElementById('numInput').value = _history[i].expr;
    convert(/* pushToHistory = */ false);
}

/*
   3. TYPE INFO
   Checks whether the result fits in each standard integer type.
   The smallest fitting type gets the "exact" highlight.
*/

var INT_TYPES = [
    { name: 'int8',   min: -128,       max: 127,        signed: true  },
    { name: 'uint8',  min: 0,          max: 255,         signed: false },
    { name: 'int16',  min: -32768,     max: 32767,       signed: true  },
    { name: 'uint16', min: 0,          max: 65535,       signed: false },
    { name: 'int32',  min: -2147483648,max: 2147483647,  signed: true  },
    { name: 'uint32', min: 0,          max: 4294967295,  signed: false },
];

function renderTypes(value) {
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
            '<div class="type-value">' + (fits ? 'fits ✓' : 'overflow ✗') + '</div>' +
        '</div>';
    }).join('');

    document.getElementById('typeGrid').innerHTML = html;
    document.getElementById('sectionTypes').style.display = '';
}

/*
   4. BIT GRID
   Renders individual bit cells (0 / 1) with position indices above them.
   Width auto-expands: 8 → 16 → 32 bits depending on the value size.
   Bits are grouped visually every 4 cells with a thin gap.
*/

function renderBitGrid(value) {
    var abs    = Math.abs(value);
    var binRaw = abs.toString(2);
    var width  = binRaw.length <= 8 ? 8 : binRaw.length <= 16 ? 16 : 32;
    var bits   = binRaw.padStart(width, '0').split('').map(Number);

    var wrap = document.getElementById('bitGrid');
    wrap.innerHTML = '';

    // Index row
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

    // Bit cells row
    var bitRow = document.createElement('div');
    bitRow.className = 'bit-row';

    for (var j = 0; j < width; j++) {
        if (j > 0 && j % 4 === 0) {
            var sep = document.createElement('div');
            sep.className = 'bit-cell sep';
            bitRow.appendChild(sep);
        }
        var cell = document.createElement('div');
        cell.className  = 'bit-cell' + (bits[j] ? ' on' : '');
        cell.textContent = bits[j].toString();
        bitRow.appendChild(cell);
    }
    wrap.appendChild(bitRow);

    document.getElementById('sectionBits').style.display = '';
}

/*
   5. ENDIANNESS
   Shows byte layout in Big Endian and Little Endian order.
   The most significant byte is highlighted in blue.
   Only visible for values larger than one byte (> 0xFF).
*/

function renderEndian(value) {
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

    function renderBytes(arr) {
        return arr.map(function(b, i) {
            var cls = i === 0 ? 'endian-byte highlight' : 'endian-byte';
            return '<span class="' + cls + '">0x' + b + '</span>';
        }).join('');
    }

    document.getElementById('endianWrap').innerHTML =
        '<div class="endian-row">' +
            '<span class="endian-label">Big</span>' +
            '<div class="endian-bytes">' + renderBytes(bytes.slice()) + '</div>' +
        '</div>' +
        '<div class="endian-row">' +
            '<span class="endian-label">Little</span>' +
            '<div class="endian-bytes">' + renderBytes(bytes.slice().reverse()) + '</div>' +
        '</div>';

    document.getElementById('sectionEndian').style.display = '';
}

/*
   6. CONVERT  (main entry point)
   Called on every keystroke. Orchestrates all sections above.
   pushToHistory = false when restoring from history (avoids duplicate entry).
*/

function convert(pushToHistory) {
    if (pushToHistory === undefined) { pushToHistory = true; }

    var raw      = document.getElementById('numInput').value.trim();
    var input    = document.getElementById('numInput');
    var errorMsg = document.getElementById('errorMsg');

    // Empty input — reset everything
    if (!raw) {
        setAll('—', '—', '—');
        input.classList.remove('error');
        errorMsg.textContent = '';
        document.getElementById('binGroups').innerHTML          = '';
        document.getElementById('sectionTypes').style.display   = 'none';
        document.getElementById('sectionBits').style.display    = 'none';
        document.getElementById('sectionEndian').style.display  = 'none';
        return;
    }

    try {
        var result = safeEval(raw);
        var isNeg  = result < 0;
        var abs    = Math.abs(result);
        var binRaw = abs.toString(2);

        // ── Main results ──
        var dec = result.toString(10);
        var hex = (isNeg ? '-' : '') + '0x' + abs.toString(16).toUpperCase();
        var bin = (isNeg ? '-' : '') + binRaw;

        input.classList.remove('error');
        errorMsg.textContent = '';

        document.getElementById('decVal').textContent = dec;
        document.getElementById('hexVal').textContent = hex;
        document.getElementById('binVal').textContent = bin;

        // Byte groups under BIN
        var padLen = Math.ceil(binRaw.length / 8) * 8;
        var padded = binRaw.padStart(padLen, '0');
        var groups = padded.match(/.{1,8}/g) || [];
        document.getElementById('binGroups').innerHTML = groups
            .map(function(b) { return '<span class="bin-byte">' + b + '</span>'; })
            .join('');

        // Extra sections
        renderTypes(result);
        renderBitGrid(result);
        renderEndian(result);

        // History (debounced 800 ms)
        if (pushToHistory) {
            if (_pushTimer) { clearTimeout(_pushTimer); }
            _pushTimer = setTimeout(function() {
                if (raw !== _lastPushed) {
                    _lastPushed = raw;
                    addHistory(raw, dec);
                }
            }, 800);
        }

    } catch (e) {
        input.classList.add('error');
        errorMsg.textContent = 'Invalid expression';
        setAll('—', '—', '—');
        document.getElementById('binGroups').innerHTML          = '';
        document.getElementById('sectionTypes').style.display   = 'none';
        document.getElementById('sectionBits').style.display    = 'none';
        document.getElementById('sectionEndian').style.display  = 'none';
    }
}


/*
   7. UTILITIES
*/

function setAll(d, h, b) {
    document.getElementById('decVal').textContent = d;
    document.getElementById('hexVal').textContent = h;
    document.getElementById('binVal').textContent = b;
}

function copyVal(id, btn) {
    var text = document.getElementById(id).textContent;
    if (text === '—') { return; }
    navigator.clipboard.writeText(text);
    var orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(function() {
        btn.textContent = orig;
        btn.classList.remove('copied');
    }, 1500);
}

function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Run once on load to initialise state
convert();

    `;
}