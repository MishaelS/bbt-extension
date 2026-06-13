# AGENTS.md - Byte Bit Tool (BBT) Extension

## Project Overview

VS Code extension for developers, reverse engineers, and security researchers. Provides:
- Number conversion (DEC/HEX/BIN) with arithmetic/bitwise operations
- ASCII mode (text ↔ hex/dec codes)
- Floating point support (v0.0.5+)
- Hover provider for numbers in code

## Key Files

| File | Purpose |
|------|---------|
| `src/extension.ts` | Entry point, registers commands and providers |
| `src/hover.ts` | Hover provider for numeric literals |
| `src/webview/index.ts` | Assembles HTML/CSS/JS for the panel |
| `src/webview/number/logic.ts` | Number mode: safeEval, convertNumber, render functions |
| `src/webview/ascii/logic.ts` | ASCII mode: detection, encoding/decoding |
| `src/webview/shared/logic.ts` | History, mode switching, copy utilities |
| `src/webview/styles.ts` | All CSS styles |
| `src/webview/html.ts` | Static HTML markup |

## Architecture
Extension Host (VS Code)
├── Hover Provider (hover.ts) -> Shows tooltips on numbers
└── Webview Panel
    ├── Number Mode (number/logic.ts) -> safeEval, conversions
    ├── ASCII Mode (ascii/logic.ts) -> text ↔ codes
    └── Shared (shared/logic.ts) -> history, mode switcher

## Important Implementation Details

### Number Mode (`number/logic.ts`)

- **`safeEval(expr)`**: Converts 0x/0b literals -> decimal, validates with regex, executes via `new Function()`, returns float
- **`convertNumber()`**: Checks integer vs float, shows full UI for integers, DEC-only for floats
- **`renderTypes()`, `renderBitGrid()`, `renderEndian()`**: Only called for integers

### ASCII Mode (`ascii/logic.ts`)

- Auto-detects input type: hex codes, dec codes, or plain text
- Bidirectional conversion
- Character cards with click-to-copy

### Hover Provider (`hover.ts`)

- Regex: `/0x[0-9a-fA-F]+|0b[01]+|-?\d+(?:\.\d+)?/`
- Shows HEX/BIN only for integers, shows "N/A (float)" otherwise

## Development Commands

```bash
npm run compile      # Compile TypeScript
npm run watch        # Auto-compile on changes
npm run test:unit    # Run unit tests
F5                   # Launch extension in debug window
```

## Testing
- Unit tests in `src/test/suite/`
- Run with `npm run test:unit`
- Integration tests require `npm test` (launches VS Code)

## Key Constraints
- **HEX/BIN only for integers** - Floating point numbers cannot be represented in these bases
- **safeEval security** - Only allows digits, operators, parentheses, and dot for floats
- **Webview isolation** - All UI runs in isolated webview, communicates via postMessage

## Build & Package
```bash
npm run package      # Create .vsix file
npm run publish      # Publish to marketplace (requires auth)
```

## Version History
- **0.0.5**: Floating point support, fixed webview issues
- **0.0.4**: ASCII mode, type checker, bit visualizer, endianness
- **0.0.2**: Initial release

## Configuration
| Setting | Default | Description |
|---------|---------|-------------|
| byteBitTool.autoSave | false | Auto-save calculations to history |
