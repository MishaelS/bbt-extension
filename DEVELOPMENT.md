# Development Guide

## Project Structure

```
bbt-extension/
├── src/
│   ├── extension.ts                # Extension entry point
│   ├── hover.ts                    # Hover provider
│   ├── webview/
│   │   ├── index.ts                # HTML document assembler
│   │   ├── html.ts                 # Static HTML markup
│   │   ├── styles.ts               # CSS styles
│   │   ├── shared/
│   │   │   └── logic.ts            # History, mode switch, utilities
│   │   ├── number/
│   │   │   └── logic.ts            # Number mode JS
│   │   ├── ascii/
│   │   │   └── logic.ts            # ASCII mode JS
│   │   ├── diff/
│   │   │   └── logic.ts            # Binary Diff mode JS
│   │   └── help/
│   │       └── logic.ts            # Help modal JS
│   └── test/
│       ├── suite/
│       │   ├── index.ts            # ...
│       │   ├── number.test.ts      # Number mode tests
│       │   ├── ascii.test.ts       # ASCII mode tests
│       │   ├── hover.test.ts       # Hover provider tests
│       │   └── shared.test.ts      # Shared logic tests
│       ├── extension.test.ts       # Main test suite
│       └── runTest.ts              # Running tests
├── out/                            # Compiled JavaScript
├── resources/
│   ├── icon.png                    # Extension icon
│   └── icon.svg                    # Extension icon
├── screenshots/
│   ├── ascii-mode.png
│   ├── number-mode.png
│   └── example_usage.gif
├── package.json                    # Extension manifest
├── tsconfig.json                   # TypeScript configuration
├── .github/
│   └── workflows/
│       └── publish.yml             # CI/CD pipeline
└── README.md                       # User documentation
```

## Architecture

### Extension Entry Point (`extension.ts`)

Registers three main components:
1. **Panel Command** - Opens BBT in a new editor tab
2. **Sidebar Provider** - Shows BBT in activity bar
3. **Hover Provider** - Shows conversions on hover

### Hover Provider (`hover.ts`)

- Detects numeric literals: DEC (`42`), HEX (`0xFF`), BIN (`0b1010`)
- Converts to other formats with proper padding
- Renders HTML tooltip with colored syntax

### Webview Components

#### `html.ts` - Pure HTML structure with no logic or styles.

#### `styles.ts` - All CSS organized into logical sections:
- Base layout & inputs
- Operator cheatsheet
- Result cards
- Type info grid
- Bit visualizer
- Endianness display
- History panel

#### `shared/logic.ts` - history management, mode switching, copy utilities, HTML escaping

#### `number/logic.ts` - safeEval expression evaluator, integer type grid, bit visualizer, endianness display

#### `ascii/logic.ts` - hex/dec code detection, text encoding/decoding, character card rendering

#### `diff/logic.ts` - Binary Diff mode JS
- **smartHexParse()** - parsing of various hex formats (spaces, 0x, commas, solid string, C-style escapes)
- **addBinaryRow()** - creating a new string with bytes
- **compareColumns()** - calculation of the status of each column (match/diff)
- **renderBinaryTable()** - illuminated comparison table render
- **toggleByteMark()** - cycle of color labels (blue → violet → cyan → none)
- **handleBinaryKeyboard()** - keyboard shortcuts (Delete, Ctrl+Delete, Ctrl+Up/Down)
- Export/import to JSON

#### `help/logic.ts` - Help modal JS
- **ShowHelp()** - opens a modal window with hints
- **switchHelpTab()** - switch between tabs `Number/ASCII/Binary Diff`
- **updateHelpContent()** - generation of contextual help
- Closing by Escape or clicking outside the window

#### `logic.ts` - Client-side JavaScript with these modules:

1. **safeEval()** - Expression evaluator
   - Converts `0x`/`0b` literals to decimal
   - Validates characters with regex
   - Uses `new Function()` for safe evaluation
   - Returns truncated integer result

2. **History** - Stores last 20 calculations
   - Debounced push (800ms)
   - Click to reload expression

3. **renderTypes()** - Integer type checking
   - Checks fit for int8/16/32 and uint8/16/32
   - Highlights smallest fitting type

4. **renderBitGrid()** - Bit visualization
   - Auto-width: 8, 16, or 32 bits
   - Groups every 4 bits
   - Highlights set bits (1)

5. **renderEndian()** - Endianness display
   - Shows Big/Little Endian byte order
   - Highlights most significant byte
   - Only for multi-byte values (> 0xFF)

6. **convert()** - Main entry point
   - Called on every keystroke
   - Orchestrates all render functions
   - Handles errors and empty input

## Expression Safety

The `safeEval()` function implements multiple security layers:

1. Convert hex (0xFF) and binary (0b1010) literals to decimal using parseInt
2. Validate only allowed characters: digits, whitespace, + - * / % & | ^ ~ < > ( )
3. Evaluate in isolated function via new Function('return (' + processed + ')')

```javascript
// Convert hex/binary literals to decimal
processed = processed.replace(/0x[0-9a-fA-F]+/gi, (m) => parseInt(m, 16).toString());
processed = processed.replace(/0b[01]+/gi, (m) => parseInt(m.slice(2), 2).toString());

// Validate only allowed characters
/^[\d\s\+\-\*\/\%\&\|\^\~\<\>\(\)]+$/.test(processed)

// Evaluate in isolated function
new Function('return (' + processed + ')')()
```

### Short Form Literals (v0.0.6+)

The extension now supports shorthand notation:

```javascript
// Standard forms (still work)
0xFF + 0b1010

// Short forms (new)
xFF + b1010
x F F        // spaces allowed
b 1 0 1 0    // spaces allowed
```

Regex patterns in `safeEval()`:
- Hex short: `/(?:^|[^a-fA-F0-9])x([0-9a-fA-F]+)/gi`
- Binary short: `/(?:^|[^01])b([01]+)/gi`

### Auto-Completion (v0.0.7+)

The 'handleNumberInputKeydown()` function in `number/logic.ts' implements:

1. **Brackets** - input `(` automatically creates `()` and puts the cursor inside
2. **Shifts** - entering `<` creates `<<`, entering `>` creates `>>`, the cursor after the operator
3. **Skip** - if the cursor is in front of `)` or `>`, the re-entry steps over the character

## Binary Diff Mode

### Supported input formats
- `DE AD BE EF' - spaces
- `0xDE,0xAD,0xBE,0xEF` - 0x prefix and commas
- `DEADBEEF` is a solid string
- `\xDE\xAD\xBE\xEF` - C-style escapes
- `DE-AD-BE-EF` - hyphens

### Keyboard shortcuts
|   Combination   |  Action  |
|-----------------|----------|
| `Delete`        | Delete selected lines |
| `Ctrl + Delete` | Delete all lines |
| `Ctrl + Up`     | Move the selected lines up |
| `Ctrl + Down`   | Move the selected lines down |

### Color scheme

|       Color       |   Value   |
|-------------------|-----------|
| Green (match)     | Byte matches all lines |
| Red (diff)        | The byte is different from the others |
| Yellow (missing)  | The byte is missing in this line |
| Blue/Violet/Blue  | Manual labels (cycle by click) |

### Interacting with bytes
- **Left click** - cyclic switching of color labels
- **Right click** - clearing the label
- Hover shows decimal and binary representation

## Help Modal

Online help, accessible by clicking `?` in the title.

- Contextual - opens in the current mode
- Three tabs - Number, ASCII, Binary Diff
- Contains tables with formats, operators, and color scheme
- Close: click on `X', Escape, click outside the window

## Webview Communication

Settings are sent from extension to webview via postMessage on load and when configuration changes. Webview listens for messages of type `settings`.

## Development Commands (build)
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Package as .vsix
npm run package

# Publish to marketplace
npm run publish
```

### Running tests
```bash
# Install the missing dependenciesrm -rf webview/
npm install --save-dev @vscode/test-electron @types/glob @types/jsdom

# Run all the tests
npm test

# Or only unit tests
npm run test:unit
```