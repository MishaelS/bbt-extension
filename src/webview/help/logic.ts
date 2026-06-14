/**
 * webview/help/logic.ts
 * Help module with usage instructions for all modes.
 */
export function getHelpLogic(): string
{
    return `

/*
   1. HELP MODAL
*/

function showHelp()
{
    var modal = document.getElementById('helpModal');
    if (!modal) {
        createHelpModal();
        modal = document.getElementById('helpModal');
    }

    var currentMode = 'number';
    if (typeof _currentMode !== 'undefined') {
        currentMode = _currentMode;
    }

    updateHelpContent(currentMode);
    modal.style.display = 'flex';
}

function createHelpModal()
{
    var modalHtml = '<div id="helpModal" class="help-modal" style="display:none">' +
        '<div class="help-modal-content">' +
            '<div class="help-modal-header">' +
                '<h2>Byte Bit Tool - Help</h2>' +
                '<button class="help-modal-close" onclick="closeHelp()">x</button>' +
            '</div>' +
            '<div class="help-modal-tabs">' +
                '<button class="help-tab" data-mode="number" onclick="switchHelpTab(\\'number\\')">Number Mode</button>' +
                '<button class="help-tab" data-mode="ascii" onclick="switchHelpTab(\\'ascii\\')">ASCII Mode</button>' +
                '<button class="help-tab" data-mode="diff" onclick="switchHelpTab(\\'diff\\')">Binary Diff Mode</button>' +
            '</div>' +
            '<div class="help-modal-body" id="helpModalBody"></div>' +
        '</div>' +
    '</div>';

    var div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);

    var modal = document.getElementById('helpModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeHelp();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var m = document.getElementById('helpModal');
            if (m && m.style.display === 'flex') {
                closeHelp();
            }
        }
    });
}

function closeHelp()
{
    var modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchHelpTab(mode)
{
    var tabs = document.querySelectorAll('.help-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    var activeTab = document.querySelector('.help-tab[data-mode="' + mode + '"]');
    if (activeTab) {
        activeTab.classList.add('active');
    }

    updateHelpContent(mode);
}

function updateHelpContent(mode)
{
    var body = document.getElementById('helpModalBody');
    if (!body) return;

    var content = '';

    if (mode === 'number') {
        content = '<div class="help-section">' +
            '<h3>Number Mode - Expression Calculator</h3>' +
            '<p>Evaluate arithmetic and bitwise expressions with support for decimal, hexadecimal, and binary numbers.</p>' +

            '<h4>Supported Number Formats</h4>' +
            '<table class="help-table">' +
                '<tr><th>Format</th><th>Example</th><th>Description</th></tr>' +
                '<tr><td>Decimal</td><td>42, -10, 255</td><td>Standard decimal numbers</td></tr>' +
                '<tr><td>Hexadecimal</td><td>0xFF, 0xDEAD, x10</td><td>0x prefix or short x prefix</td></tr>' +
                '<tr><td>Binary</td><td>0b1010, b1111</td><td>0b prefix or short b prefix</td></tr>' +
            '</table>' +

            '<h4>Operators</h4>' +
            '<table class="help-table">' +
                '<tr><th>Type</th><th>Operators</th><th>Example</th></tr>' +
                '<tr><td>Arithmetic</td><td>+ - * / %</td><td>5 + 3 * 2</td></tr>' +
                '<tr><td>Bitwise</td><td>& | ^ ~ << >></td><td>0xFF & 0x0F</td></tr>' +
                '<tr><td>Grouping</td><td>( )</td><td>(5 + 3) * 2</td></tr>' +
            '</table>' +

            '<h4>Auto-Completion</h4>' +
            '<ul>' +
                '<li>Type "(" - automatically inserts () and places cursor inside</li>' +
                '<li>Type "<" - automatically inserts << (shift left operator)</li>' +
                '<li>Type ">" - automatically inserts >> (shift right operator)</li>' +
                '<li>Type ")" - skips over existing closing parenthesis</li>' +
            '</ul>' +

            '<h4>Output Features</h4>' +
            '<ul>' +
                '<li>DEC - Decimal result</li>' +
                '<li>HEX - Hexadecimal with byte padding</li>' +
                '<li>BIN - Binary with byte grouping (8 bits per group)</li>' +
                '<li>Integer Types - Shows which integer types the value fits into</li>' +
                '<li>Bit Visualization - Visual representation of bits (8/16/32 bits)</li>' +
                '<li>Endianness - Big/Little Endian byte order for multi-byte values</li>' +
            '</ul>' +

            '<h4>Tips</h4>' +
            '<ul>' +
                '<li>Press Enter to save calculation to history</li>' +
                '<li>Click Copy to copy any result to clipboard</li>' +
                '<li>Click history items to restore previous calculations</li>' +
                '<li>Floating point numbers show DEC only (HEX/BIN only for integers)</li>' +
            '</ul>' +
        '</div>';
    } else if (mode === 'ascii') {
        content = '<div class="help-section">' +
            '<h3>ASCII Mode - Text to Code Conversion</h3>' +
            '<p>Convert between plain text and hexadecimal/decimal ASCII codes.</p>' +

            '<h4>Input Types (Auto-Detected)</h4>' +
            '<table class="help-table">' +
                '<tr><th>Input Type</th><th>Example</th><th>Output</th></tr>' +
                '<tr><td>Plain Text</td><td>Hello</td><td>Hex: 0x48 0x65 0x6C 0x6C 0x6F<br>Dec: 72 101 108 108 111</td></tr>' +
                '<tr><td>Hex Codes</td><td>0x48 0x65 0x6C or 48 65 6C</td><td>Text: Hel</td></tr>' +
                '<tr><td>Decimal Codes</td><td>72 101 108</td><td>Text: Hel</td></tr>' +
            '</table>' +

            '<h4>Supported Hex Formats</h4>' +
            '<ul>' +
                '<li>48 65 6C - Space separated</li>' +
                '<li>0x48,0x65,0x6C - With 0x prefix and commas</li>' +
                '<li>48656C - Continuous hex string</li>' +
            '</ul>' +

            '<h4>Non-Printable Characters</h4>' +
            '<ul>' +
                '<li>Space -> [space]</li>' +
                '<li>Line Feed (LF) -> [LF]</li>' +
                '<li>Carriage Return (CR) -> [CR]</li>' +
                '<li>Tab -> [TAB]</li>' +
                '<li>Other -> [*]</li>' +
            '</ul>' +

            '<h4>Features</h4>' +
            '<ul>' +
                '<li>Click on any character card to copy that character</li>' +
                '<li>Direction indicator shows conversion type</li>' +
                '<li>Results show both hex and decimal representations</li>' +
            '</ul>' +
        '</div>';
    } else if (mode === 'diff') {
        content = '<div class="help-section">' +
            '<h3>Binary Diff Mode - Compare Hex Dumps</h3>' +
            '<p>Compare multiple binary/hex strings byte by byte with visual highlighting.</p>' +

            '<h4>Adding Rows</h4>' +
            '<ul>' +
                '<li>Enter a name in the left input field</li>' +
                '<li>Paste hex bytes in the right textarea</li>' +
                '<li>Press Enter in hex input to add row</li>' +
            '</ul>' +

            '<h4>Supported Input Formats</h4>' +
            '<ul>' +
                '<li>DE AD BE EF - Space separated bytes</li>' +
                '<li>0xDE,0xAD,0xBE,0xEF - With 0x prefix and commas</li>' +
                '<li>DEADBEEF - Continuous hex string</li>' +
                '<li>DE-AD-BE-EF - With dashes</li>' +
            '</ul>' +

            '<h4>Visual Indicators</h4>' +
            '<table class="help-table">' +
                '<tr><th>Color</th><th>Meaning</th></tr>' +
                '<tr><td>Normal</td><td>Byte matches all other rows in this column</td></tr>' +
                '<tr><td>Red</td><td>Byte differs from other rows</td></tr>' +
                '<tr><td>Yellow</td><td>Missing byte</td></tr>' +
                '<tr><td>Blue/Purple/Cyan</td><td>Manual mark (click to cycle)</td></tr>' +
            '</table>' +

            '<h4>Interactions</h4>' +
            '<ul>' +
                '<li>Click on a byte -> cycles through mark colors</li>' +
                '<li>Right-click on a byte -> clears manual mark</li>' +
                '<li>Click on row -> selects row (Ctrl+Click for multi-select)</li>' +
                '<li>Double-click on row label -> copies entire row as hex</li>' +
                '<li>Delete key -> removes selected row(s)</li>' +
                '<li>Ctrl+Delete -> removes all rows</li>' +
                '<li>Ctrl+Up/Down -> move selected rows</li>' +
            '</ul>' +

            '<h4>Tips</h4>' +
            '<ul>' +
                '<li>Column header shows (all same) or (has differences)</li>' +
                '<li>Hover over column header to see variant values</li>' +
                '<li>Use marks to highlight important bytes for analysis</li>' +
            '</ul>' +
        '</div>';
    }

    body.innerHTML = content;
}

    `;
}