import * as assert from 'assert';

describe('Hover Provider Tests', () => {
    describe('Number parsing', () => {
        function parseNumericWord(word: string): { value: number; detectedBase: string } | null {
            // Copy of the logic from hover.ts
            if (/^0x[0-9a-fA-F]+$/i.test(word)) {
                const value = parseInt(word.slice(2), 16);
                return isNaN(value) ? null : { value, detectedBase: 'hex' };
            }

            if (/^0b[01]+$/i.test(word)) {
                const value = parseInt(word.slice(2), 2);
                return isNaN(value) ? null : { value, detectedBase: 'bin' };
            }

            if (/^-?\d+(?:\.\d+)?$/.test(word)) {
                const value = parseFloat(word);
                return isNaN(value) ? null : { value, detectedBase: 'dec' };
            }

            return null;
        }

        it('should parse decimal integer', () => {
            const result = parseNumericWord('42');
            assert.strictEqual(result?.value, 42);
            assert.strictEqual(result?.detectedBase, 'dec');
        });

        it('should parse negative decimal', () => {
            const result = parseNumericWord('-42');
            assert.strictEqual(result?.value, -42);
            assert.strictEqual(result?.detectedBase, 'dec');
        });

        it('should parse decimal float', () => {
            const result = parseNumericWord('3.14');
            assert.strictEqual(result?.value, 3.14);
            assert.strictEqual(result?.detectedBase, 'dec');
        });

        it('should parse negative float', () => {
            const result = parseNumericWord('-3.14');
            assert.strictEqual(result?.value, -3.14);
            assert.strictEqual(result?.detectedBase, 'dec');
        });

        it('should parse hexadecimal', () => {
            const result = parseNumericWord('0xFF');
            assert.strictEqual(result?.value, 255);
            assert.strictEqual(result?.detectedBase, 'hex');
        });

        it('should parse binary', () => {
            const result = parseNumericWord('0b1010');
            assert.strictEqual(result?.value, 10);
            assert.strictEqual(result?.detectedBase, 'bin');
        });

        it('should reject invalid number', () => {
            const result = parseNumericWord('not a number');
            assert.strictEqual(result, null);
        });

        it('should reject hex without prefix', () => {
            const result = parseNumericWord('FF');
            assert.strictEqual(result, null);
        });
    });

    describe('Number formatting', () => {
        function toHexDigits(value: number): string {
            if (Math.floor(value) !== value) {
                return 'N/A (float)';
            }

            const raw = Math.abs(value).toString(16).toUpperCase();
            const padLen = Math.ceil(raw.length / 2) * 2;
            return raw.padStart(padLen, '0');
        }

        function toBinDigits(value: number): string {
            if (Math.floor(value) !== value) {
                return 'N/A (float)';
            }

            const raw = Math.abs(value).toString(2);
            const padLen = Math.ceil(raw.length / 8) * 8;
            const padded = raw.padStart(padLen, '0');
            return (padded.match(/.{1,8}/g) || []).join(' ');
        }

        it('should format hex with byte padding', () => {
            assert.strictEqual(toHexDigits(255), 'FF');
            assert.strictEqual(toHexDigits(256), '0100');
            assert.strictEqual(toHexDigits(15), '0F');
        });

        it('should return N/A for float hex', () => {
            assert.strictEqual(toHexDigits(3.14), 'N/A (float)');
        });

        it('should format binary with byte grouping', () => {
            assert.strictEqual(toBinDigits(255), '11111111');
            assert.strictEqual(toBinDigits(256), '00000001 00000000');
        });

        it('should return N/A for float binary', () => {
            assert.strictEqual(toBinDigits(3.14), 'N/A (float)');
        });
    });
});