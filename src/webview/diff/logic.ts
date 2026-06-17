/**
 * webview/diff/logic.ts
 * Client-side JS for Binary Diff mode.
 *
 * Sections:
 *   1. State      - binary rows and selected row
 *   2. Parsing    - smartHexParse
 *   3. Rows       - add, remove, update
 *   4. Compare    - column status calculation
 *   5. Marking    - manual byte color marks
 *   6. Rendering  - table and toolbar
 */
export function getDiffLogic(): string
{
    return `

/*
   1. STATE
*/

window._binaryRows = [];
var _selectedBinaryRowId = null;
var _selectedBinaryRowIds = [];
var _binaryRowCounter = 1;

/*
   2. PARSING
*/

function smartHexParse(input)
{
    var raw = String(input || '').trim();
    var bytes = [];

    if (!raw) { return bytes; }

    var normalized = raw
        .replace(/\\\\x/gi, ' 0x')
        .replace(/0x/gi, ' 0x')
        .replace(/[,;:\\|]/g, ' ')
        .replace(/\\[/g, ' ')
        .replace(/\\]/g, ' ')
        .replace(/\\{/g, ' ')
        .replace(/\\}/g, ' ')
        .replace(/\\(/g, ' ')
        .replace(/\\)/g, ' ');

    var tokens = normalized.split(/\\s+/).filter(function(part) {
        return part.length > 0;
    });

    if (tokens.length > 1) {
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i].replace(/^0x/i, '');
            if (/^[0-9a-fA-F]+$/.test(token)) {
                if (token.length % 2 !== 0) {
                    token = '0' + token;
                }

                for (var partIndex = 0; partIndex < token.length; partIndex += 2) {
                    bytes.push(parseInt(token.substr(partIndex, 2), 16));
                }
            }
        }

        if (bytes.length > 0) { return bytes; }
    }

    var compact = raw
        .replace(/\\\\x/gi, '')
        .replace(/0x/gi, '')
        .replace(/[^0-9a-fA-F]/g, '');

    if (compact.length % 2 !== 0) {
        compact = '0' + compact;
    }

    for (var j = 0; j < compact.length; j += 2) {
        bytes.push(parseInt(compact.substr(j, 2), 16));
    }

    return bytes;
}

/*
   3. ROWS
*/

function addBinaryRow(name, hexString)
{
    var rowNumber = _binaryRowCounter++;
    // var displayName = name || ('Row ' + rowNumber);
    var displayName = name;
    var input = hexString || '';

    var row = {
        id: crypto.randomUUID(),
        number: rowNumber,
        name: displayName,
        bytes: smartHexParse(input),
        originalInput: input,
        marks: {}
    };

    window._binaryRows.push(row);
    _selectedBinaryRowId = row.id;
    _selectedBinaryRowIds = [row.id];
    renderBinaryTable();
}

function isBinaryRowSelected(id)
{
    return _selectedBinaryRowIds.indexOf(id) !== -1;
}

function getSelectedBinaryRows()
{
    var rows = [];

    for (var i = 0; i < window._binaryRows.length; i++) {
        if (isBinaryRowSelected(window._binaryRows[i].id)) {
            rows.push(window._binaryRows[i]);
        }
    }

    return rows;
}

function removeBinaryRow(id)
{
    removeBinaryRows([id]);
}

function removeBinaryRows(ids)
{
    var nextRows = [];

    for (var i = 0; i < window._binaryRows.length; i++) {
        if (ids.indexOf(window._binaryRows[i].id) === -1) {
            nextRows.push(window._binaryRows[i]);
        }
    }

    window._binaryRows = nextRows;

    _selectedBinaryRowId = null;
    _selectedBinaryRowIds = [];

    renderBinaryTable();
}

function removeAllBinaryRows()
{
    window._binaryRows = [];
    _selectedBinaryRowId = null;
    _selectedBinaryRowIds = [];
    renderBinaryTable();
}

function updateBinaryRowName(id, newName)
{
    for (var i = 0; i < window._binaryRows.length; i++) {
        if (window._binaryRows[i].id === id) {
            window._binaryRows[i].name = newName || ('Row ' + window._binaryRows[i].number);
            break;
        }
    }
}

function selectBinaryRow(id, event)
{
    var multiSelect = event && (event.metaKey || event.ctrlKey);

    if (multiSelect) {
        var index = _selectedBinaryRowIds.indexOf(id);
        if (index === -1) {
            _selectedBinaryRowIds.push(id);
        } else {
            _selectedBinaryRowIds.splice(index, 1);
        }
    } else {
        _selectedBinaryRowIds = [id];
    }

    _selectedBinaryRowId = id;
    renderBinaryTable();
}

function clearBinaryInputs()
{
    var nameInput = document.getElementById('binaryNameInput');
    var hexInput = document.getElementById('binaryHexInput');

    if (nameInput) { nameInput.value = ''; }
    if (hexInput) { hexInput.value = ''; }
}

function promptAddBinaryRow()
{
    var nameInput = document.getElementById('binaryNameInput');
    var hexInput = document.getElementById('binaryHexInput');
    var input = hexInput ? hexInput.value : '';
    var name = nameInput ? nameInput.value : '';

    if (!input.trim()) {
        input = prompt('Enter hex bytes');
        if (input === null) { return; }
    }

    addBinaryRow(name, input);
    clearBinaryInputs();
}

function removeSelectedBinaryRow()
{
    if (!_selectedBinaryRowIds.length && _selectedBinaryRowId) {
        _selectedBinaryRowIds = [_selectedBinaryRowId];
    }

    if (!_selectedBinaryRowIds.length) { return; }
    removeBinaryRows(_selectedBinaryRowIds.slice());
}

function parseBinaryFromClipboard()
{
    navigator.clipboard.readText().then(function(text) {
        if (!text || !text.trim()) { return; }
        var hexInput = document.getElementById('binaryHexInput');
        if (hexInput) { hexInput.value = text; }
        addBinaryRow('Clipboard ' + _binaryRowCounter, text);
    }).catch(function() {
        var input = prompt('Paste hex bytes');
        if (input !== null) {
            addBinaryRow('Pasted ' + _binaryRowCounter, input);
        }
    });
}

function moveSelectedBinaryRows(direction)
{
    if (!_selectedBinaryRowIds.length) { return; }

    if (direction < 0) {
        for (var i = 1; i < window._binaryRows.length; i++) {
            if (isBinaryRowSelected(window._binaryRows[i].id) && !isBinaryRowSelected(window._binaryRows[i - 1].id)) {
                var prev = window._binaryRows[i - 1];
                window._binaryRows[i - 1] = window._binaryRows[i];
                window._binaryRows[i] = prev;
            }
        }
    } else {
        for (var j = window._binaryRows.length - 2; j >= 0; j--) {
            if (isBinaryRowSelected(window._binaryRows[j].id) && !isBinaryRowSelected(window._binaryRows[j + 1].id)) {
                var next = window._binaryRows[j + 1];
                window._binaryRows[j + 1] = window._binaryRows[j];
                window._binaryRows[j] = next;
            }
        }
    }

    renderBinaryTable();
}

/*
   4. COMPARE
*/

function compareColumns()
{
    var maxBytes = 0;
    var statuses = [];

    for (var i = 0; i < window._binaryRows.length; i++) {
        if (window._binaryRows[i].bytes.length > maxBytes) {
            maxBytes = window._binaryRows[i].bytes.length;
        }
    }

    for (var col = 0; col < maxBytes; col++) {
        var firstValue = null;
        var hasValue = false;
        var hasDiff = false;

        for (var rowIndex = 0; rowIndex < window._binaryRows.length; rowIndex++) {
            var row = window._binaryRows[rowIndex];

            if (col >= row.bytes.length) {
                continue;
            }

            if (!hasValue) {
                firstValue = row.bytes[col];
                hasValue = true;
            } else if (row.bytes[col] !== firstValue) {
                hasDiff = true;
            }
        }

        statuses[col] = hasDiff ? 'diff' : 'match';
    }

    return statuses;
}

/*
   5. MARKING
*/

function toggleByteMark(id, col)
{
    for (var i = 0; i < window._binaryRows.length; i++) {
        var row = window._binaryRows[i];

        if (row.id === id) {
            if (!row.marks) { row.marks = {}; }

            var current = row.marks[col];
            if (!current) {
                row.marks[col] = 'mark-blue';
            } else if (current === 'mark-blue') {
                row.marks[col] = 'mark-violet';
            } else if (current === 'mark-violet') {
                row.marks[col] = 'mark-cyan';
            } else {
                delete row.marks[col];
            }

            break;
        }
    }

    renderBinaryTable();
}

function clearByteMark(id, col)
{
    for (var i = 0; i < window._binaryRows.length; i++) {
        var row = window._binaryRows[i];

        if (row.id === id) {
            if (row.marks && row.marks[col]) {
                delete row.marks[col];
            }

            break;
        }
    }

    renderBinaryTable();
}

function clearBinaryMarks()
{
    for (var i = 0; i < window._binaryRows.length; i++) {
        window._binaryRows[i].marks = {};
    }

    renderBinaryTable();
}

function copyBinaryRow(id)
{
    for (var i = 0; i < window._binaryRows.length; i++) {
        var row = window._binaryRows[i];

        if (row.id === id) {
            var text = row.bytes.map(function(byte) {
                return byteToHex(byte);
            }).join(' ');

            navigator.clipboard.writeText(text);
            break;
        }
    }
}

function handleBinaryHexInputKeydown(event)
{
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        promptAddBinaryRow();
    }
}

function handleBinaryKeyboard(event)
{
    var active = document.activeElement;
    var inTextInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    var isDiff = typeof _currentMode !== 'undefined' && _currentMode === 'diff';

    if (!isDiff) { return; }

    if (inTextInput) {
        return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Delete') {
        event.preventDefault();
        removeAllBinaryRows();
        return;
    }

    if (event.key === 'Delete') {
        event.preventDefault();
        removeSelectedBinaryRow();
        return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowUp') {
        event.preventDefault();
        moveSelectedBinaryRows(-1);
        return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowDown') {
        event.preventDefault();
        moveSelectedBinaryRows(1);
    }
}

/*
   6. RENDERING
*/

function byteToHex(value)
{
    return value.toString(16).toUpperCase().padStart(2, '0');
}

function binaryEscAttr(value)
{
    return escHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderBinaryHeader(maxBytes)
{
    var html = '<div class="binary-header">' +
        '<div class="binary-row-label-header">Row</div>';

    for (var i = 0; i < maxBytes; i++) {
        var groupedClass = i > 0 && i % 8 === 0 ? ' group-start' : '';
        html += '<div class="byte-cell' + groupedClass + '">' + byteToHex(i) + '</div>';
    }

    html += '</div>';
    return html;
}

function renderBinaryTable()
{
    var container = document.getElementById('binaryTable');
    if (!container) { return; }

    var currentTable = container.querySelector('.binary-table');
    var scrollLeft = currentTable ? currentTable.scrollLeft : 0;
    var scrollTop = currentTable ? currentTable.scrollTop : 0;
    var rows = window._binaryRows;
    var maxBytes = 0;

    for (var i = 0; i < rows.length; i++) {
        if (rows[i].bytes.length > maxBytes) {
            maxBytes = rows[i].bytes.length;
        }
    }

    if (!rows.length) {
        container.innerHTML = '<div class="binary-empty">No binary rows yet</div>';
        return;
    }

    var statuses = compareColumns();
    var html = '<div class="binary-table" style="--binary-byte-count:' + maxBytes + '">';
    html += renderBinaryHeader(maxBytes);

    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var row = rows[rowIndex];
        var selectedClass = isBinaryRowSelected(row.id) ? ' selected' : '';

        html += '<div class="binary-row' + selectedClass + '" onclick="selectBinaryRow(\\'' + row.id + '\\', event)">' +
            '<div class="binary-row-label" ondblclick="event.stopPropagation();copyBinaryRow(\\'' + row.id + '\\')">' +
                '<span class="row-number">#' + row.number + '</span>' +
                '<input class="row-name-input" type="text" value="' + binaryEscAttr(row.name) + '" ' +
                    'onclick="event.stopPropagation()" ' +
                    'oninput="updateBinaryRowName(\\'' + row.id + '\\', this.value)" />' +
            '</div>';

        for (var col = 0; col < maxBytes; col++) {
            var groupedClass = col > 0 && col % 8 === 0 ? ' group-start' : '';
            var markClass = row.marks && row.marks[col] ? ' ' + row.marks[col] : '';

            if (col >= row.bytes.length) {
                html += '<div class="byte-cell missing' + groupedClass + '">--</div>';
            } else {
                html += '<div class="byte-cell ' + statuses[col] + groupedClass + markClass + '" ' +
                    'onclick="event.stopPropagation();toggleByteMark(\\'' + row.id + '\\',' + col + ')" ' +
                    'oncontextmenu="event.preventDefault();event.stopPropagation();clearByteMark(\\'' + row.id + '\\',' + col + ')">' +
                    byteToHex(row.bytes[col]) +
                '</div>';
            }
        }

        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    var nextTable = container.querySelector('.binary-table');
    if (nextTable) {
        nextTable.scrollLeft = scrollLeft;
        nextTable.scrollTop = scrollTop;
    }
}

function initBinaryDiff()
{
    if (window._binaryRows.length > 0) { return; }
    renderBinaryTable();
}

document.addEventListener('keydown', handleBinaryKeyboard);

    `;
}
