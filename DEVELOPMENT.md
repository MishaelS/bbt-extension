# Development Guide

## Project Structure

```
bbt-extension/
├── out/                               # Compiled JavaScript
├── src/
│   ├── extension.ts                   # Extension entry point
│   ├── hover.ts                       # Hover provider
│   ├── webview/
│   │   ├── index.ts                   # HTML document assembler
│   │   ├── html.ts                    # Static HTML markup
│   │   ├── styles.ts                  # CSS styles
│   │   ├── shared/
│   │   │   └── logic.ts               # History, mode switch, utilities
│   │   ├── number/
│   │   │   └── logic.ts               # Number mode JS
│   │   ├── ascii/
│   │   │   └── logic.ts               # ASCII mode JS
│   │   ├── diff/
│   │   │   └── logic.ts               # Binary Diff mode JS
│   │   ├── help/
│   │   │   └── logic.ts               # Help modal JS
│   │   └── kitten/
│   │       └── logic.ts               # Kitten animation JS
│   └── test/
│       ├── suite/
│       │   ├── index.ts               # ...
│       │   ├── number.test.ts         # Number mode tests
│       │   ├── ascii.test.ts          # ASCII mode tests
│       │   ├── hover.test.ts          # Hover provider tests
│       │   └── shared.test.ts         # Shared logic tests
│       ├── extension.test.ts          # Main test suite
│       └── runTest.ts                 # Running tests
├── resources/
│   ├── icon.png                       # Extension icon
│   ├── icon.svg                       # Extension icon
│   └── kitten/                        # Cat frames, there is an idea to add different skins
│       └── frame_original_cat/        # Standard skin without items
│           ├── bongo_both_down.svg    # Frame two paws on a table
│           ├── bongo_both_up.svg      # Frame two paws raised
│           ├── bongo_left_down.svg    # Frame the left foot is raised
│           ├── bongo_right_down.svg   # Frame the right foot is raised
│           └── bongo_sleeping.svg     # Frame paws on the table and eyes closed
├── screenshots/
│   ├── screenshots/ascii-mode-1.png
│   ├── screenshots/ascii-mode-2.png
│   ├── screenshots/binary-diff-mode-1.png
│   ├── screenshots/binary-diff-mode-2.png
│   ├── screenshots/number-mode-1.png
│   ├── screenshots/number-mode-2.png
│   ├── screenshots/example_usage.gif
│   └── screenshots/help-mode.png
├── package.json                       # Extension manifest
├── tsconfig.json                      # TypeScript configuration
├── .github/
│   └── workflows/
│       ├── pr.yml                     # Launching testers
│       ├── release.yml                # Building a project
│       └── test.yml                   # Autotests with Push and Tag
├── vsc-extension-quickstart.md        # Basic information about VSC extensions
├── AGENTS.md                          # Information for the AI agent about the project
├── CHANGELOG.md                       # Information about updates
├── DEVELOPMENT.md                     # Development documentation
├── LICENSE                            # License Information
└── README.md                          # User documentation
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

#### `kitten/logic.ts` - Kitten Animation Module (v0.0.8+)

- **FSM-based animation controller** — Finite State Machine with states: IDLE, LEFT_HIT, RIGHT_HIT, BOTH_HIT
- **`detectHand(key)`** — identifies left/right hand based on key press (supports EN/RU layouts)
- **`handleHand(hand)`** — main keystroke handler, tracks active keys via Set
- **`enterState(next)`** — state transition with auto-return to IDLE after 80ms
- **Floating window** — positioned above all VS Code tabs and status bar
- **Keyboard detection** — uses `Set` for O(1) lookup performance
- **Configurable** — `byteBitTool.kittenEnabled` setting
- **Frame pre-loading** — SVG paths built once on init, not rebuilt on every keystroke
- **Hover state** — shows sleeping frame on mouse hover
- **Click handler** — displays "meow!" bubble on click
- **Global keyboard tracking** — responds to typing anywhere in VS Code via `onDidChangeTextDocument` broadcast

### FSM States

|    State    |        Description       |          Frame         |
|-------------|--------------------------|------------------------|
| `IDLE`      | Waiting for input        | `bongo_both_up.svg`    |
| `LEFT_HIT`  | Left hand typing         | `bongo_right_down.svg` |
| `RIGHT_HIT` | Right hand typing        | `bongo_left_down.svg`  |
| `BOTH_HIT`  | Two or more keys pressed | `bongo_both_down.svg`  |
| `SLEEPING`  | Mouse hover state        | `bongo_sleeping.svg`   |

### Keyboard Detection Sets

```javascript
const LEFT_KEYS = new Set([
    '1','2','3','4','5',
    'q','w','e','r','t','a','s','d','f','g','z','x','c','v','b',
    'й','ц','у','к','е','ф','ы','в','а','п','я','ч','с','м','и',
    ' ','tab','shift','control','alt','meta'
]);

const RIGHT_KEYS = new Set([
    '6','7','8','9','0','-','=',
    'y','u','i','o','p','[',']','h','j','k','l','n','m',
    'н','г','ш','щ','з','х','ъ','р','о','л','д','ж','э','т','ь','б','ю','.',
    'enter','backspace','delete'
]);
```

### Extension Integration

Kitten receives keystroke events via:

1. Direct keydown/keyup — inside the kitten webview itself (fallback)
2. Broadcast from extension — broadcastKittenKeystroke() sends events to all active webviews
3. Text change listener — onDidChangeTextDocument detects typing in any editor

### Frame Duration

- HIT_DURATION = 80ms — snappy response time
- Returns to IDLE after 80ms if no keys are held

### Performance Optimizations

- SVG paths pre-loaded in _src object — no string concatenation on keystrokes
- Set for key lookup — O(1) vs Array.indexOf O(n)
- Single DOM element — minimal reflows
- requestAnimationFrame not needed — simple setTimeout for FSM

## 3. В конец раздела "Webview Communication" добавить:

### Kitten Broadcast System

The extension broadcasts keystroke events to all active webviews:

```typescript
// Track all active webviews
const activeWebviews: Set<vscode.Webview> = new Set();

// Broadcast keystroke to all kitten instances
function broadcastKittenKeystroke(hand: 'left' | 'right' | 'both'): void {
   for (const webview of activeWebviews) {
      webview.postMessage({ type: 'kitten_keystroke', hand });
   }
}

// Listen to text changes in any editor
vscode.workspace.onDidChangeTextDocument(event => {
   const lastChange = event.contentChanges[event.contentChanges.length - 1];
   const hand = detectHandServer(lastChange.text);
   broadcastKittenKeystroke(hand);
});
```

### Kitten webview listens for messages:

```typescript
window.addEventListener('message', function(event) {
   if (msg.type === 'kitten_keystroke') {
      handleHand(msg.hand);
   }
});
```

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
|   Combination   |             Action           |
|-----------------|------------------------------|
| `Delete`        | Delete selected lines        |
| `Ctrl + Delete` | Delete all lines             |
| `Ctrl + Up`     | Move the selected lines up   |
| `Ctrl + Down`   | Move the selected lines down |

### Color scheme

|       Color       |                  Value                |
|-------------------|---------------------------------------|
| Green (match)     | Byte matches all lines                |
| Red (diff)        | The byte is different from the others |
| Yellow (missing)  | The byte is missing in this line      |
| Blue/Violet/Blue  | Manual labels (cycle by click)        |

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