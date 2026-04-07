import { getStyles } from './design';

// Function for obtaining HTML structures
function getHTMLStructure(): string {
    return `
        <h1>BBT (Byte-Bit-Tool)</h1>

        <div class="input-group">
            <input
                type="text"
                id="numInput"
                placeholder=" ... "
                oninput="convert()"
                autofocus
            />
        </div>

        <div class="error-msg" id="errorMsg"></div>

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
    `;
}

// Function with JavaScript logic
function getJavaScriptLogic(): string {
    return `
        // Function for safely calculating expressions
        function safeEval(expr) {
            // Replacing hex and bin literals with decimal numbers
            let processed = expr;

            // Replacing hex numbers (0xFF, 0x00, etc.)
            processed = processed.replace(/0x[0-9a-fA-F]+/gi, function(match) {
                return parseInt(match, 16).toString();
            });

            // Replacing bin numbers (0b1010, 0b0011, etc.)
            processed = processed.replace(/0b[01]+/gi, function(match) {
                return parseInt(match.slice(2), 2).toString();
            });

            // Validation - numbers only, operators, brackets, spaces
            if (!/^[\\d\\s\\+\\-\\*\\/\\%\\&\\|\\^\\~\\<\\>\\(\\)]+$/.test(processed)) {
                throw new Error('Invalid characters in expression');
            }

            // Using the Constructor Function for safe evaluation
            try {
                const fn = new Function('return (' + processed + ')');
                const result = fn();

                if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
                    throw new Error('Invalid result');
                }

                return Math.trunc(result);
            } catch (e) {
                throw new Error('Evaluation error');
            }
        }

        // Conversion function and display of results
        function convert() {
            const raw = document.getElementById('numInput').value.trim();
            const input = document.getElementById('numInput');
            const errorMsg = document.getElementById('errorMsg');

            if (!raw) {
                setAll('—', '—', '—');
                input.classList.remove('error');
                errorMsg.textContent = '';
                document.getElementById('binGroups').innerHTML = '';
                return;
            }

            try {
                const result = safeEval(raw);
                const isNeg = result < 0;
                const abs = Math.abs(result);

                const dec = result.toString(10);
                const hex = (isNeg ? '-' : '') + '0x' + abs.toString(16).toUpperCase();
                const binRaw = abs.toString(2);
                const bin = (isNeg ? '-' : '') + binRaw;

                input.classList.remove('error');
                errorMsg.textContent = '';

                document.getElementById('decVal').textContent = dec;
                document.getElementById('hexVal').textContent = hex;
                document.getElementById('binVal').textContent = bin;

                // Splitting into bytes (8 bits each)
                if (binRaw.length > 0) {
                    const padLen = Math.ceil(binRaw.length / 8) * 8;
                    const padded = binRaw.padStart(padLen, '0');
                    const groups = padded.match(/.{1,8}/g) || [];
                    document.getElementById('binGroups').innerHTML = groups
                        .map(function(b) { 
                            return '<span class="bin-byte">' + b + '</span>';
                        })
                        .join('');
                } else {
                    document.getElementById('binGroups').innerHTML = '';
                }

            } catch(e) {
                input.classList.add('error');
                errorMsg.textContent = 'Invalid expression';
                setAll('—', '—', '—');
                document.getElementById('binGroups').innerHTML = '';
            }
        }

        // Setting all values
        function setAll(d, h, b) {
            document.getElementById('decVal').textContent = d;
            document.getElementById('hexVal').textContent = h;
            document.getElementById('binVal').textContent = b;
        }

        // Copying function to clipboard
        function copyVal(id, btn) {
            const text = document.getElementById(id).textContent;
            if (text === '—') { return; }
            navigator.clipboard.writeText(text);
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied';
            btn.classList.add('copied');
            setTimeout(function() {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 1500);
        }

        // Initializing conversion
        convert();
    `;
}

// The main function of getting the full webview content
export function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Byte Bit Tool</title>
    <style>${getStyles()}</style>
</head>
<body>
    ${getHTMLStructure()}
    <script>${getJavaScriptLogic()}</script>
</body>
</html>`;
}