/**
 * webview/shared/logic.ts
 * Shared client-side JS: history, mode switcher, copy, escaping.
 *
 * Sections:
 *   1. History     — unified history for Number and ASCII modes
 *   2. Mode switch — setMode(), toggles visible panels
 *   3. Utilities   — copyVal(), escHtml()
 */
export function getSharedLogic(): string
{
    return `

/*
   1. HISTORY
*/

var _numHistory      = [];
var _asciiHistory    = [];
var _numPushTimer    = null;
var _asciiPushTimer  = null;
var _numLastPushed   = null;
var _asciiLastPushed = null;
var _autoSave        = false; // overridden by VS Code on load via postMessage
var _storagePrefix   = 'bbt:no-workspace';

// Storage keys
function getStorageKeys()
{
    return {
        NUM_HISTORY  : _storagePrefix + ':num_history',
        ASCII_HISTORY: _storagePrefix + ':ascii_history'
    };
}

// Load history from localStorage
function loadHistoryFromStorage()
{
    try {
        var keys = getStorageKeys();
        var savedNumHistory = localStorage.getItem(keys.NUM_HISTORY);
        if (savedNumHistory) {
            _numHistory = JSON.parse(savedNumHistory);
        } else {
            _numHistory = [];
        }

        var savedAsciiHistory = localStorage.getItem(keys.ASCII_HISTORY);
        if (savedAsciiHistory) {
            _asciiHistory = JSON.parse(savedAsciiHistory);
        } else {
            _asciiHistory = [];
        }

        renderHistory();
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

// Save history to localStorage
function saveHistoryToStorage()
{
    try {
        var keys = getStorageKeys();
        localStorage.setItem(keys.NUM_HISTORY, JSON.stringify(_numHistory));
        localStorage.setItem(keys.ASCII_HISTORY, JSON.stringify(_asciiHistory));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function addToHistory(expr, result, mode)
{
    var list = mode === 'number' ? _numHistory : _asciiHistory;

    if (list.length && list[0].expr === expr) { return; }
    list.unshift({ expr: expr, result: result, mode: mode });
    if (list.length > 20) { list.pop(); }

    renderHistory();
    saveHistoryToStorage();
}

function clearHistory()
{
    _numHistory      = [];
    _asciiHistory    = [];
    _numLastPushed   = null;
    _asciiLastPushed = null;
    renderHistory();
    saveHistoryToStorage();

    // Return focus to the active input field
    if (_currentMode === 'number') {
        document.getElementById('numInput').focus();
    } else if (_currentMode === 'ascii') {
        document.getElementById('asciiInput').focus();
    }
}

function renderHistory()
{
    var el       = document.getElementById('historyList');
    var combined = _numHistory.slice().concat(_asciiHistory.slice());

    if (!combined.length) {
        el.innerHTML = '<div class="history-empty">No calculations yet</div>';
        return;
    }

    window._combinedHistory = combined;

    el.innerHTML = combined.map(function(h, i) {
        var prefix        = h.mode === 'number' ? '[NUM] ' : '[ASC] ';
        var displayResult = h.mode === 'number'
            ? h.result
            : '"' + (h.result.length > 30 ? h.result.slice(0, 27) + '...' : h.result) + '"';

        return '<div class="history-item" onclick="loadFromHistory(' + i + ')">' +
            '<span class="history-expr">'   + prefix + escHtml(h.expr)   + '</span>' +
            '<span class="history-result">-> ' + escHtml(displayResult)  + '</span>' +
        '</div>';
    }).join('');
}

function loadFromHistory(i)
{
    var item = window._combinedHistory[i];
    if (!item) { return; }

    if (item.mode === 'number') {
        setMode('number');
        document.getElementById('numInput').value = item.expr;
        convertNumber(false);
        document.getElementById('numInput').focus();  // Add focus
    } else if (item.mode === 'ascii') {
        setMode('ascii');
        document.getElementById('asciiInput').value = item.expr;
        convertAscii();
        document.getElementById('asciiInput').focus();  // Add focus
    }
}

function saveCurrentToHistory()
{
    if (_currentMode === 'number') {
        var raw = document.getElementById('numInput').value.trim();
        var dec = document.getElementById('decVal').textContent;
        if (raw && dec !== '—') {
            _numLastPushed = raw;
            addToHistory(raw, dec, 'number');
        }
    } else if (_currentMode === 'ascii') {
        var input  = document.getElementById('asciiInput').value;
        var result = document.getElementById('asciiTextVal').textContent;
        if (input.trim() && result !== '—') {
            _asciiLastPushed = input;
            addToHistory(input, result, 'ascii');
        }
    }
}

/*
   2. MODE SWITCH
*/

var _currentMode = 'number';

function setMode(mode)
{
    if (mode !== 'number' && mode !== 'ascii' && mode !== 'diff') {
        mode = 'number';
    }

    _currentMode = mode;

    document.getElementById('modeNumber').classList.remove('active');
    document.getElementById('modeAscii').classList.remove('active');
    document.getElementById('modeDiff').classList.remove('active');

    var isNumber = mode === 'number';
    var isAscii  = mode === 'ascii';
    var isDiff   = mode === 'diff';

    document.getElementById(isNumber ? 'modeNumber' : isAscii ? 'modeAscii' : 'modeDiff').classList.add('active');

    document.getElementById('numberMode').style.display     = isNumber ? 'block' : 'none';
    document.getElementById('asciiMode').style.display      = isAscii  ? 'block' : 'none';
    document.getElementById('diffMode').style.display       = isDiff   ? 'block' : 'none';
    document.getElementById('numberResults').style.display  = isNumber ? 'block' : 'none';
    document.getElementById('asciiResults').style.display   = isAscii  ? 'block' : 'none';
    document.getElementById('diffResults').style.display    = isDiff   ? 'block' : 'none';
    document.getElementById('historySection').style.display = isDiff   ? 'none'  : 'block';

    if (isNumber) { 
        convertNumber(); 
        document.getElementById('numInput').focus();  // Set focus to number input after mode switch
    } else if (isAscii) { 
        convertAscii();
        document.getElementById('asciiInput').focus();  // Set focus to ascii input after mode switch
    } else {
        renderBinaryTable();
    }
}

/*
   3. UTILITIES
*/

function copyVal(id, btn)
{
    var text = document.getElementById(id).textContent;
    if (text === '—') { return; }

    navigator.clipboard.writeText(text);

    var orig = btn.textContent;
    btn.textContent = 'ok';
    btn.classList.add('copied');

    setTimeout(function() {
        btn.textContent = orig;
        btn.classList.remove('copied');
    }, 1200);
}

function escHtml(s)
{
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/* Boot */
window.addEventListener('message', function(event) {
    var msg = event.data;
    if (msg.type === 'settings') {
        _autoSave = !!msg.autoSave;
        if (msg.workspaceKey) {
            _storagePrefix = 'bbt:' + msg.workspaceKey;
            loadHistoryFromStorage();
        }
    }
});

initBinaryDiff();
loadHistoryFromStorage();
convertNumber();

// Set focus to number input on page load
document.getElementById('numInput').focus();

    `;
}
