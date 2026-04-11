# Change Log

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