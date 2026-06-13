# Change Log

## [0.0.6] - 2026-06-13

### Added

- **Short form literals** - Support for shorthand hex (`xFF`) and binary (`b1010`) prefixes
- **Persistent history** - Calculation history now saved between VS Code sessions using localStorage
- **Auto-focus on input fields** - Automatic focus when switching modes or loading from history

### Changed

- `safeEval()` now recognizes `x` prefix for hex and `b` prefix for binary literals
- Hover provider detects short form literals in code
- History storage moved to localStorage for persistence across sessions
- Input fields automatically get focus on page load, mode switch, and history load

### Fixed

- History now properly persists after VS Code restart
- Focus management improved for better UX

### Technical Details

- Short form literals maintain full backward compatibility with standard `0x`/`0b` prefixes
- History limited to 20 entries per mode with automatic storage
- Focus management implemented in `setMode()`, `loadFromHistory()`, and `clearHistory()`

## [0.0.5] - 2026-06-12

### Added

- **Floating point number support** - Now you can evaluate expressions with decimal numbers (e.g., `5.5 + 3.2`, `10 / 3`, `0xFF + 0.5`)
- Automatic detection of integer vs floating point results
- Clear visual indication when HEX/BIN conversions are not available for float results (`— (float only)`)
- Informational message for float results explaining that HEX/BIN views only apply to integers

### Changed

- `safeEval()` now preserves floating point values instead of truncating to integers
- `convertNumber()` now handles two paths:
  - **Integer path**: Full conversion with HEX, BIN, type checker, bit visualizer, endianness display
  - **Float path**: Shows only DEC value with clear indication that HEX/BIN are not available
- Regular expression in `safeEval()` now includes dot (`.`) for decimal numbers
- Hover provider fully supports floating point numbers with appropriate messages

### Fixed

- Webview initialization issues that prevented Number Mode from responding
- Mode switcher functionality restored
- Proper handling of mixed expressions (e.g., `0xFF + 0.5`)

### Technical Details

- Float numbers are mathematically correct - HEX/BIN only exist for integers
- Bitwise operations (`&`, `|`, `^`, `<<`, `>>`, `>>>`) still work correctly with integers
- All existing integer functionality remains unchanged

## [0.0.4] - 2026-04-11

### Added

- ASCII conversion mode with bidirectional transformation between text and hex/dec codes
- Auto-detection of hex codes (0xXX or XX), decimal codes, and plain text input
- Character card view with click-to-copy character functionality
- Integer type checker showing fit for int8/16/32 and uint8/16/32
- Bit visualizer with indexed bit cells (auto-width 8/16/32 bits)
- Endianness display for values larger than one byte (Big and Little Endian)
- Calculation history panel storing last 20 entries across both modes
- Auto-save to history with 800ms debounce (configurable via byteBitTool.autoSave)
- Clear history button
- Sidebar view in Activity Bar
- Configuration setting: byteBitTool.autoSave

### Changed

- Mode switcher (Number / ASCII) replaces single Number mode
- History now stores expression and result for both modes
- Enter key saves current calculation when auto-save is disabled
- Copy buttons show temporary confirmation
- Hover tooltip uses colored HTML output with syntax highlighting

### Fixed

- Bitwise shift operators (<<, >>, >>>) now work correctly with hex and binary literals


## [0.0.3] - 2026-04-11
### Added
- GitHub Actions CI/CD pipeline
- Automated publishing on tag push
- Development documentation

### Fixed
- (List any fixes here)

## [0.0.2] - 2026-04-10
### Added
- Initial release
- Decimal, Hexadecimal, Binary conversion
- Arithmetic operations support
- Bitwise operations support
- Copy to clipboard functionality
- Activity Bar integration
- Keyboard shortcut (Ctrl+Shift+B)

## [0.0.1] - 2026-04-08
### Added
- Initial release
- Decimal, Hexadecimal, Binary conversion
- Arithmetic operations support
- Bitwise operations support
- Copy to clipboard functionality
- Activity Bar integration
- Keyboard shortcut (Ctrl+Shift+B)