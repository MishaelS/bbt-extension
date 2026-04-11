# Byte Bit Tool (BBT)

[![Version](https://img.shields.io/visual-studio-marketplace/v/mishaels.byte-bit-tool)](https://marketplace.visualstudio.com/items?itemName=mishaels.byte-bit-tool)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/mishaels.byte-bit-tool)](https://marketplace.visualstudio.com/items?itemName=mishaels.byte-bit-tool)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/mishaels.byte-bit-tool)](https://marketplace.visualstudio.com/items?itemName=mishaels.byte-bit-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Byte Bit Tool** is a VS Code extension for developers, reverse engineers, and security researchers. Convert numbers between decimal, hexadecimal, and binary formats with support for arithmetic and bitwise operations — directly in your editor.

## Features

### Core Conversion
- **Instant conversion** between DEC, HEX, and BIN
- **Smart expression evaluation** with full operator support
- **Real-time updates** as you type

### Arithmetic & Bitwise Operations
| Category | Operators |
|----------|-----------|
| Arithmetic | `+` `-` `*` `/` `%` |
| Bitwise | `&` `\|` `^` `~` `<<` `>>` `>>>` |
| Grouping | `(` `)` |

### Advanced Features
- **Integer type checking** - See if values fit in int8/16/32 or uint8/16/32
- **Bit visualization** - Visual bit grid with position indices
- **Endianness display** - Big and Little Endian byte layouts
- **Calculation history** - Auto-saves last 20 calculations
- **One-click copy** - Copy any result to clipboard

### Hover Provider
Hover over any number in your code to see conversions:
- Decimal (`42`)
- Hexadecimal (`0x2A`)
- Binary (`0b00101010`)
- Beautiful colored output with syntax highlighting

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Byte Bit Tool"
4. Click Install

Or install from marketplace: [Byte Bit Tool](https://marketplace.visualstudio.com/items?itemName=mishaels.byte-bit-tool)

## Usage

### Open the Tool
- Click the **BBT icon** (symbol-number) in the Activity Bar (left sidebar)
- Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac)
- Open Command Palette (`Ctrl+Shift+P`) → `Byte Bit Tool: Open`

### Examples

| Expression | Result |
|------------|--------|
| `0xFF + 1` | DEC: 256, HEX: 0x100, BIN: 100000000 |
| `0b1010 & 0b1100` | DEC: 8, HEX: 0x8, BIN: 1000 |
| `(0x1F << 2) \| 0b11` | DEC: 127, HEX: 0x7F, BIN: 1111111 |
| `0xFFFF >> 8` | DEC: 255, HEX: 0xFF, BIN: 11111111 |

### Using the Hover Feature
1. Open any code file
2. Hover your mouse over any number (e.g., `0xFF`, `42`, `0b1010`)
3. A tooltip will appear showing conversions to other formats

### Copy Results
- Click the **Copy** button next to any result
- The value is copied to your clipboard
- Button shows "✓ Copied" confirmation

### Calculation History
- Last 20 calculations are automatically saved
- Click any history item to reload the expression
- Use the **clear** button to reset history

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open BBT | `Ctrl+Shift+B` | `Cmd+Shift+B` |

## Supported Number Formats

- **Decimal**: `42`, `-10`, `255`
- **Hexadecimal**: `0xFF`, `0xDEADBEEF`
- **Binary**: `0b1010`, `0b11110000`

## Integer Type Checking

The tool automatically checks if your number fits in:
- `int8`: -128 to 127
- `uint8`: 0 to 255
- `int16`: -32,768 to 32,767
- `uint16`: 0 to 65,535
- `int32`: -2,147,483,648 to 2,147,483,647
- `uint32`: 0 to 4,294,967,295

The smallest type that fits is highlighted in green.

## Bit Visualization

- Shows individual bits with position indices
- Bits are grouped every 4 cells for readability
- Set bits (1) are highlighted in blue
- Width auto-expands: 8 → 16 → 32 bits

## Endianness Display

For values larger than one byte (> 0xFF), shows:
- **Big Endian**: Most significant byte first
- **Little Endian**: Least significant byte first
- Most significant byte is highlighted

## Requirements

- VS Code version 1.80.0 or higher

## Extension Settings

This extension does not add any VS Code settings.

## Known Issues

No known issues at this time.

## Release Notes

### 0.0.2
- Initial release
- Decimal, Hexadecimal, Binary conversion
- Arithmetic operations support
- Bitwise operations support
- Copy to clipboard functionality
- Activity Bar integration
- Keyboard shortcut (Ctrl+Shift+B)

---

## For Developers

### Building from Source

```bash
# Clone the repository
git clone https://github.com/MishaelS/bbt-extension.git
cd bbt-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch