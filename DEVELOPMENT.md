# Development Guide

## Project Structure

```
bbt-extension/
├── out/
│   ├── extension.js
│   ├── extension.js.map
│   ├── hover.js
│   ├── hover.js.map
│   └── webview/
│       ├── index.js
│       ├── index.js.map
│       ├── html.js
│       ├── html.js.map
│       ├── styles.js
│       ├── styles.js.map
│       └── logic.js
│       └── logic.js.map
├── src/
│   ├── extension.ts    # Extension entry point
│   ├── hover.ts        # Hover provider for number conversion
│   └── webview/
│       ├── index.ts    # HTML document assembler
│       ├── html.ts     # Static HTML markup
│       ├── styles.ts   # CSS styles
│       └── logic.ts    # Client-side JavaScript
├── resources/
│   └── icon.png        # Extension icon
│   └── icon.svg        # Extension icon
├── package.json        # Extension manifest
├── tsconfig.json       # TypeScript configuration
├── .github/
│   └── workflows/
│       └── publish.yml # CI/CD pipeline
└── README.md           # User documentation
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

#### `html.ts`
Pure HTML structure with no logic or styles.

#### `styles.ts`
All CSS organized into logical sections:
- Base layout & inputs
- Operator cheatsheet
- Result cards
- Type info grid
- Bit visualizer
- Endianness display
- History panel

#### `logic.ts`
Client-side JavaScript with these modules:

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

### Expression Safety

The `safeEval()` function implements multiple security layers:

```javascript
// 1. Convert hex/binary literals to decimal
processed = processed.replace(/0x[0-9a-fA-F]+/gi, (m) => parseInt(m, 16).toString());
processed = processed.replace(/0b[01]+/gi, (m) => parseInt(m.slice(2), 2).toString());

// 2. Validate only allowed characters
/^[\d\s\+\-\*\/\%\&\|\^\~\<\>\(\)]+$/.test(processed)

// 3. Evaluate in isolated function
new Function('return (' + processed + ')')()
```

## Development Commands
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