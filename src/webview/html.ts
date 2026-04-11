/**
 * html.ts
 * Static HTML structure of the BBT webview panel.
 * No logic, no styles — only markup.
 */
export function getHTML(): string {
    return `
        <h1>BBT (Byte-Bit-Tool)</h1>

        <!-- Input -->
        <div class="input-group">
            <input
                type="text"
                id="numInput"
                placeholder="0xFF + 0b1010 * 3"
                oninput="convert()"
                autofocus
            />
        </div>

        <div class="error-msg" id="errorMsg"></div>

        <!-- Operator cheatsheet -->
        <div class="cheatsheet">
            <span class="op" title="Addition">+</span>
            <span class="op" title="Subtraction">-</span>
            <span class="op" title="Multiplication">*</span>
            <span class="op" title="Division">/</span>
            <span class="op" title="Modulo">%</span>
            <span class="sep"></span>
            <span class="op" title="Bitwise AND">&amp;</span>
            <span class="op" title="Bitwise OR">|</span>
            <span class="op" title="Bitwise XOR">^</span>
            <span class="op" title="Bitwise NOT">~</span>
            <span class="op" title="Left shift">&lt;&lt;</span>
            <span class="op" title="Right shift">&gt;&gt;</span>
            <span class="op" title="Unsigned right shift">&gt;&gt;&gt;</span>
        </div>

        <!-- Result cards -->
        <div class="results">
            <div class="result-card">
                <span class="result-label dec">DEC</span>
                <span class="result-value" id="decVal">—</span>
                <button class="copy-btn" onclick="copyVal('decVal', this)">Copy</button>
            </div>
            <div class="result-card">
                <span class="result-label hex">HEX</span>
                <span class="result-value" id="hexVal">—</span>
                <button class="copy-btn" onclick="copyVal('hexVal', this)">Copy</button>
            </div>
            <div class="result-card">
                <span class="result-label bin">BIN</span>
                <div style="flex:1">
                    <span class="result-value" id="binVal">—</span>
                    <div class="bin-groups" id="binGroups"></div>
                </div>
                <button class="copy-btn" onclick="copyVal('binVal', this)">Copy</button>
            </div>
        </div>

        <!-- Integer type info (shown after calculation) -->
        <div class="section" id="sectionTypes" style="display:none">
            <div class="section-title">Integer types</div>
            <div class="type-grid" id="typeGrid"></div>
        </div>

        <!-- Bit visualizer (shown after calculation) -->
        <div class="section" id="sectionBits" style="display:none">
            <div class="section-title">Bit visualization</div>
            <div class="bit-grid-wrap" id="bitGrid"></div>
        </div>

        <!-- Endianness (shown only for multi-byte values) -->
        <div class="section" id="sectionEndian" style="display:none">
            <div class="section-title">Endianness</div>
            <div class="endian-wrap" id="endianWrap"></div>
        </div>

        <!-- History -->
        <div class="section">
            <div class="section-title">
                History
                <button class="history-clear" onclick="clearHistory()">clear</button>
            </div>
            <div class="history-list" id="historyList">
                <div class="history-empty">No calculations yet</div>
            </div>
        </div>
    `;
}