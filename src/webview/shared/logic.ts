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

// Storage keys
var STORAGE_KEYS = {
    NUM_HISTORY  : 'bbt_num_history',
    ASCII_HISTORY: 'bbt_ascii_history'
};

// Load history from localStorage
function loadHistoryFromStorage()
{
    try {
        var savedNumHistory = localStorage.getItem(STORAGE_KEYS.NUM_HISTORY);
        if (savedNumHistory) {
            _numHistory = JSON.parse(savedNumHistory);
        }

        var savedAsciiHistory = localStorage.getItem(STORAGE_KEYS.ASCII_HISTORY);
        if (savedAsciiHistory) {
            _asciiHistory = JSON.parse(savedAsciiHistory);
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
        localStorage.setItem(STORAGE_KEYS.NUM_HISTORY, JSON.stringify(_numHistory));
        localStorage.setItem(STORAGE_KEYS.ASCII_HISTORY, JSON.stringify(_asciiHistory));
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
    } else {
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
    } else {
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
    } else {
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
    _currentMode = mode;

    document.getElementById('modeNumber').classList.remove('active');
    document.getElementById('modeAscii').classList.remove('active');
    document.getElementById(mode === 'number' ? 'modeNumber' : 'modeAscii').classList.add('active');

    var isNumber = mode === 'number';
    document.getElementById('numberMode').style.display    = isNumber ? 'block' : 'none';
    document.getElementById('asciiMode').style.display     = isNumber ? 'none'  : 'block';
    document.getElementById('numberResults').style.display = isNumber ? 'block' : 'none';
    document.getElementById('asciiResults').style.display  = isNumber ? 'none'  : 'block';

    if (isNumber) { 
        convertNumber(); 
        document.getElementById('numInput').focus();  // Set focus to number input after mode switch
    } else { 
        convertAscii();
        document.getElementById('asciiInput').focus();  // Set focus to ascii input after mode switch
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
    }
});

convertNumber();

// Set focus to number input on page load
document.getElementById('numInput').focus();

    `;
}