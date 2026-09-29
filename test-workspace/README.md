# BBT Manual Test Workspace

This workspace is opened automatically by the `Run BBT in Test Workspace`
debug configuration.

## Number mode smoke tests

Open **Byte Bit Tool: Open Byte Bit Tool** from the Command Palette and try:

```text
9007199254740993 + 10
0xFF > 128 && true
true && !false
1 + 2, 0x10, 5 > 3
(x10 << 8) | 0x31
10 / 3
```

Expected multi-expression DEC result: `3, 16, true`.

## Hover smoke tests

Open `numbers.ts` and hover over the numeric literals.

## Text highlight smoke tests

1. Select several expressions in `numbers.ts`.
2. Right-click and run **Byte Bit Tool: Highlight Selected Text**.
3. Apply different colors to different selections.
4. Edit text inside and before a highlight; the colored range should follow the edit.
5. Test **Clear Highlight from Selected Text** and **Clear All Text Highlights in File**.
