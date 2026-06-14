/**
 * html.ts
 * Static HTML markup for the BBT webview panel.
 * No logic, no styles — only structure.
 */
export function getMarkup(): string {
    return `
        <div class="title-bar">
            <h1>BBT (Byte-Bit-Tool)</h1>
            <button class="help-btn" onclick="showHelp()" title="Help">?</button>
        </div>

        <!-- Mode switcher -->
        <div class="mode-switcher">
            <button class="mode-btn active" id="modeNumber" onclick="setMode('number')">Number</button>
            <button class="mode-btn"        id="modeAscii"  onclick="setMode('ascii')">ASCII</button>
            <button class="mode-btn"        id="modeDiff"   onclick="setMode('diff')">Binary Diff</button>
        </div>

        <!-- Number mode: input -->
        <div id="numberMode" style="display:block">
            <div class="input-group">
                <input
                    type="text"
                    id="numInput"
                    placeholder="Enter a number or expression"
                    oninput="convertNumber()"
                    onkeydown="handleNumberInputKeydown(event); if(event.key==='Enter'){saveCurrentToHistory();}"
                    autofocus
                />
            </div>
            <div class="error-msg" id="numErrorMsg"></div>
        </div>

        <!-- ASCII mode: input -->
        <div id="asciiMode" style="display:none">
            <div class="input-group">
                <input
                    type="text"
                    id="asciiInput"
                    placeholder="Enter text or codes (hex / dec)"
                    oninput="convertAscii()"
                    onkeydown="if(event.key==='Enter'){saveCurrentToHistory();}"
                />
            </div>
            <div class="error-msg" id="asciiErrorMsg"></div>
        </div>

        <!-- Binary Diff mode: input -->
        <div id="diffMode" style="display:none">
            <div class="binary-input-panel">
                <input
                    type="text"
                    id="binaryNameInput"
                    class="binary-name-input"
                    placeholder="Row name"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();promptAddBinaryRow();}"
                />
                <textarea
                    id="binaryHexInput"
                    class="binary-hex-input"
                    placeholder="Paste hex bytes: DE AD BE EF, 0xDEADBEEF, \\xDE\\xAD..."
                    onkeydown="handleBinaryHexInputKeydown(event)"
                ></textarea>
            </div>
        </div>

        <!-- Number mode: results -->
        <div id="numberResults">
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

            <div class="section" id="sectionTypes" style="display:none">
                <div class="section-title">Integer types</div>
                <div class="type-grid" id="typeGrid"></div>
            </div>

            <div class="section" id="sectionBits" style="display:none">
                <div class="section-title">Bit visualization</div>
                <div class="bit-grid-wrap" id="bitGrid"></div>
            </div>

            <div class="section" id="sectionEndian" style="display:none">
                <div class="section-title">Endianness</div>
                <div class="endian-wrap" id="endianWrap"></div>
            </div>
        </div>

        <!-- ASCII mode: results -->
        <div id="asciiResults" style="display:none">
            <div class="results">
                <div class="result-card">
                    <span class="result-label ascii">TEXT</span>
                    <div style="flex:1">
                        <div style="font-size:10px;opacity:0.5;margin-bottom:4px" id="asciiDirection"></div>
                        <div class="result-value ascii-preview" id="asciiTextVal">—</div>
                    </div>
                    <button class="copy-btn" onclick="copyVal('asciiTextVal', this)">Copy</button>
                </div>
                <div class="result-card">
                    <span class="result-label hex">HEX</span>
                    <div style="flex:1">
                        <div class="result-value" id="asciiHexVal" style="font-size:11px;word-break:break-all">—</div>
                        <div id="asciiHexChars"></div>
                    </div>
                    <button class="copy-btn" onclick="copyVal('asciiHexVal', this)">Copy</button>
                </div>
                <div class="result-card">
                    <span class="result-label dec">DEC</span>
                    <div style="flex:1">
                        <div class="result-value" id="asciiDecVal" style="font-size:11px;word-break:break-all">—</div>
                        <div id="asciiDecChars"></div>
                    </div>
                    <button class="copy-btn" onclick="copyVal('asciiDecVal', this)">Copy</button>
                </div>
            </div>

            <div class="section" id="sectionAsciiInfo" style="display:none">
                <div class="section-title">ASCII info</div>
                <div style="display:flex;gap:16px;font-size:10px;opacity:0.6">
                    <span>click char to copy</span>
                    <span>[space] = space</span>
                    <span>● = non-printable</span>
                </div>
            </div>
        </div>

        <!-- Binary Diff mode: results -->
        <div id="diffResults" style="display:none">
            <div class="section">
                <div class="section-title">Binary Diff Viewer</div>
                <div id="binaryTable"></div>
            </div>
        </div>

        <!-- History -->
        <div class="section" id="historySection">
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
